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
  if (!/linkedin\.com\/login/i.test(currentUrl)) {
    console.log('An existing LinkedIn session is already active.');
    return;
  }

  const emailField = await page.waitForSelector(selectors.emailInput, { visible: true, timeout: 15000 });
  const passwordField = await page.waitForSelector(selectors.passwordInput, { visible: true, timeout: 15000 });

  if (!emailField || !passwordField) {
    throw new Error('LinkedIn login fields were not found.');
  }

  await replaceFieldValue(page, selectors.emailInput, email);
  await replaceFieldValue(page, selectors.passwordInput, password);

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
