import { Page } from 'puppeteer';

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

async function replaceFieldValue(page: Page, selector: string, value: string): Promise<void> {
  const field = await page.waitForSelector(selector, { visible: true, timeout: 15000 });
  await field.click({ clickCount: 3 });
  await field.type(value);
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

  const emailField = await page.$(selectors.emailInput);
  const passwordField = await page.$(selectors.passwordInput);

  if (!emailField || !passwordField) {
    console.log('\nLinkedIn did not expose the expected login fields.');
    console.log('Use the visible browser window to complete sign-in manually.');
    await ask('Press Enter after LinkedIn sign-in is complete');

    if (await isAuthenticated(page)) {
      console.log('Manual LinkedIn sign-in detected; continuing.');
      return;
    }
  }

  const loginEmailField = await page.$(selectors.emailInput);
  const loginPasswordField = await page.$(selectors.passwordInput);

  if (!loginEmailField || !loginPasswordField) {
    throw new Error(
      'LinkedIn login fields are unavailable and the session is not authenticated. Check the visible browser window.'
    );
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
