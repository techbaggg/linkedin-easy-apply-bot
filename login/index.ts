import { Page, ElementHandle } from 'puppeteer';

import ask from '../utils/ask';
import selectors from '../selectors';

interface Params {
  page: Page;
  email: string;
  password: string;
}

async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();

  if (/linkedin\.com\/(feed|jobs|mynetwork|messaging|notifications|in)\b/i.test(url)) {
    return true;
  }

  const authenticatedUi = await page.$(
    'nav[aria-label="Primary Navigation"], a[href*="/feed/"], a[href*="/mynetwork/"], a[href*="/messaging/"], a[href*="/notifications/"]'
  );

  return !!authenticatedUi;
}

async function waitForHumanChallenge(page: Page): Promise<void> {
  const challenge = await page.$(selectors.captcha) || await page.$(selectors.challenge);
  if (!challenge) return;

  console.log('\nLinkedIn requires a verification/challenge step.');
  console.log('Complete it manually in the browser window. This program will not bypass it.');
  await ask('Press Enter after the challenge is complete');
}

async function findUsableField(page: Page, selector: string): Promise<ElementHandle<Element>> {
  const fields = await page.$$(selector);

  for (const field of fields) {
    const visible = await field.isIntersectingViewport().catch(() => false);
    const box = await field.boundingBox().catch(() => null);

    if (visible && box && box.width > 0 && box.height > 0) {
      return field;
    }
  }

  throw new Error(`No visible, usable input found for selector: ${selector}`);
}

async function replaceFieldValue(page: Page, selector: string, value: string): Promise<void> {
  const field = await findUsableField(page, selector);

  await field.evaluate((element) => {
    const input = element as HTMLInputElement;
    input.scrollIntoView({ block: 'center', inline: 'nearest' });
    input.focus();
    input.select();
  });

  await page.keyboard.press('Backspace');
  await field.type(value, { delay: 20 });
}

async function login({ page, email, password }: Params): Promise<void> {
  await page.goto('https://www.linkedin.com/feed/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log(`LinkedIn session page loaded: ${page.url()}`);

  if (await isAuthenticated(page)) {
    console.log('Existing LinkedIn session detected; continuing.');
    return;
  }

  await page.goto('https://www.linkedin.com/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log(`LinkedIn login page loaded: ${page.url()}`);

  if (await isAuthenticated(page)) {
    console.log('Existing LinkedIn session detected; continuing.');
    return;
  }

  try {
    await page.waitForSelector(selectors.emailInput, { visible: true, timeout: 15000 });
    await page.waitForSelector(selectors.passwordInput, { visible: true, timeout: 15000 });
  } catch {
    console.log('\nLinkedIn did not expose the expected login fields.');
    console.log('Use the visible browser window to complete sign-in manually.');
    await ask('Press Enter after LinkedIn sign-in is complete');

    if (await isAuthenticated(page)) {
      console.log('Manual LinkedIn sign-in detected; continuing.');
      return;
    }
  }

  await replaceFieldValue(page, selectors.emailInput, email);
  await replaceFieldValue(page, selectors.passwordInput, password);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => undefined),
    page.click(selectors.loginSubmit)
  ]);

  await waitForHumanChallenge(page);

  if (await isAuthenticated(page)) {
    console.log('LinkedIn session ready.');
    return;
  }

  if (/\/login|\/checkpoint|\/challenge/i.test(page.url())) {
    throw new Error('LinkedIn login did not complete. Finish the verification manually and restart.');
  }

  throw new Error(`LinkedIn authentication could not be confirmed at ${page.url()}`);
}

export default login;
