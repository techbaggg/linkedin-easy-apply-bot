import { Page } from 'puppeteer';

import ask from '../utils/ask';
import selectors from '../selectors';

interface Params {
  page: Page;
  email: string;
  password: string;
}

async function waitForHumanChallenge(page: Page): Promise<void> {
  const challenge = await page.$(selectors.captcha) || await page.$(selectors.challenge);
  if (!challenge) return;

  console.log('\nLinkedIn requires a verification/challenge step.');
  console.log('Complete it manually in the browser window. This program will not bypass it.');
  await ask('Press Enter after the challenge is complete');
}

async function replaceFieldValue(page: Page, selector: string, value: string): Promise<void> {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.type(selector, value);
}

async function login({ page, email, password }: Params): Promise<void> {
  await page.goto('https://www.linkedin.com/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  const currentUrl = page.url();
  console.log(`LinkedIn login page loaded: ${currentUrl}`);

  if (!/linkedin\.com\/login/i.test(currentUrl)) {
    console.log('An existing LinkedIn session is already active.');
    return;
  }

  const emailSelector = selectors.emailInput;
  const passwordSelector = selectors.passwordInput;

  try {
    await page.waitForSelector(emailSelector, { visible: true, timeout: 15000 });
  } catch {
    console.log('\nThe expected LinkedIn login fields were not found.');
    console.log('Inspect the open browser window. If LinkedIn is showing a verification or alternate login screen, complete it manually.');
    await ask('Press Enter after the LinkedIn page is ready for login');
  }

  const emailField = await page.$(emailSelector);
  const passwordField = await page.$(passwordSelector);

  if (!emailField || !passwordField) {
    throw new Error(
      'LinkedIn login fields are still unavailable. The page may be showing a sign-in variant or verification screen.'
    );
  }

  await replaceFieldValue(page, emailSelector, email);
  await replaceFieldValue(page, passwordSelector, password);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => undefined),
    page.click(selectors.loginSubmit)
  ]);

  await waitForHumanChallenge(page);

  if (/\/login|\/checkpoint|\/challenge/i.test(page.url())) {
    throw new Error('LinkedIn login did not complete. Finish the verification manually and restart.');
  }

  console.log('LinkedIn session ready.');
}

export default login;
