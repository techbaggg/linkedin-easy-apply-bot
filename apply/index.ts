import { Page } from 'puppeteer';

import selectors from '../selectors';
import fillFields from '../apply-form/fillFields';
import waitForNoError from '../apply-form/waitForNoError';
import clickNextButton from '../apply-form/clickNextButton';

export interface ApplicationFormData {
  phone: string;
  cvPath: string;
  homeCity: string;
  coverLetterPath: string;
  yearsOfExperience: { [key: string]: number };
  languageProficiency: { [key: string]: string };
  requiresVisaSponsorship: boolean;
  booleans: { [key: string]: boolean };
  textFields: { [key: string]: string };
  multipleChoiceFields: { [key: string]: string };
}

interface Params {
  page: Page;
  link: string;
  formData: ApplicationFormData;
}

async function apply({ page, link, formData }: Params): Promise<void> {
  await page.goto(link, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  try {
    await page.waitForSelector(selectors.easyApplyButtonEnabled, { timeout: 15000 });
    await page.click(selectors.easyApplyButtonEnabled);
  } catch {
    console.log(`Easy Apply was not available: ${link}`);
    return;
  }

  for (let step = 0; step < 8; step++) {
    await page.waitForSelector(selectors.modal, { visible: true, timeout: 10000 }).catch(() => undefined);

    await fillFields(page, formData).catch((error) => {
      console.log('Some fields could not be filled:', error instanceof Error ? error.message : error);
    });

    const submitButton = await page.$(selectors.submit);
    if (submitButton) {
      console.log('\nApplication is ready for your review.');
      console.log('The Submit button will NOT be clicked automatically.');
      await page.bringToFront();
      await new Promise<void>((resolve) => {
        process.stdin.once('data', () => resolve());
        console.log('Review the application in the browser, then press Enter here to continue to the next job.');
      });
      return;
    }

    const next = await page.$(selectors.nextButton);
    if (!next) {
      await waitForNoError(page).catch(() => undefined);
      throw new Error('Neither a Next/Review button nor a final Submit button was found.');
    }

    const disabled = await next.evaluate((el) => (el as HTMLButtonElement).disabled);
    if (disabled) {
      console.log('Next/Review is disabled. Review the highlighted fields manually.');
      await new Promise<void>((resolve) => {
        process.stdin.once('data', () => resolve());
      });
      return;
    }

    await next.click();
    await waitForNoError(page).catch(() => undefined);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  throw new Error('Application form exceeded the supported number of steps.');
}

export default apply;
