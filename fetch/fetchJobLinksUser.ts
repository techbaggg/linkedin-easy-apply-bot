import { ElementHandle, Page } from 'puppeteer';
import LanguageDetect from 'languagedetect';

import buildUrl from '../utils/buildUrl';
import wait from '../utils/wait';
import selectors from '../selectors';

const MAX_PAGE_SIZE = 7;
const languageDetector = new LanguageDetect();

async function getJobSearchMetadata({ page, location, keywords }: { page: Page, location: string, keywords: string }) {
  await page.goto('https://linkedin.com/jobs', { waitUntil: "load" });
  console.log(`Jobs page loaded: ${page.url()}`);

  // Allow LinkedIn's client-side Jobs UI to render before inspecting the DOM.
  await new Promise(resolve => setTimeout(resolve, 5000));

  const inputsInfo = await page.$$eval('input', inputs =>
    inputs.map(i => ({
      id: i.id,
      ariaLabel: i.getAttribute('aria-label'),
      placeholder: (i as HTMLInputElement).placeholder,
      name: i.name,
      type: i.type
    }))
  );
  console.log('Inputs on page (after 5s):', JSON.stringify(inputsInfo, null, 2));

  await page.screenshot({ path: 'debug-jobs-page.png', fullPage: true });
  console.log('Screenshot saved to debug-jobs-page.png');

  await page.waitForSelector(selectors.keywordInput, { visible: true, timeout: 15000 });
  await page.type(selectors.keywordInput, keywords);
  console.log('Keyword field found and filled.');

  await page.waitForSelector(selectors.locationInput, { visible: true, timeout: 15000 });
  await page.$eval(selectors.locationInput, (el, location) => (el as HTMLInputElement).value = location, location);
  await page.type(selectors.locationInput, ' ');
  console.log('Location field found and filled.');

  await page.waitForSelector(selectors.searchSubmit, { visible: true, timeout: 15000 });
  await page.$eval(selectors.searchSubmit, (el) => (el as HTMLButtonElement).click());

  await page.waitForFunction(
    () => new URLSearchParams(document.location.search).has('geoId'),
    { timeout: 15000 }
  );
  console.log(`Search results URL: ${page.url()}`);

  const geoId = await page.evaluate(() => new URLSearchParams(document.location.search).get('geoId'));

  const numJobsHandle = await page.waitForSelector(selectors.searchResultListText, { timeout: 5000 }) as ElementHandle<HTMLElement>;
  const numAvailableJobs = await numJobsHandle.evaluate((el) => parseInt((el as HTMLElement).innerText.replace(',', '')));

  return {
    geoId,
    numAvailableJobs
  };
};

interface PARAMS {
  page: Page,
  location: string,
  keywords: string,
  workplace: { remote: boolean, onSite: boolean, hybrid: boolean },
  jobTitle: string,
  jobDescription: string,
  jobDescriptionLanguages: string[]
};

/**
 * Fetches job links as a user (logged in)
 */
async function* fetchJobLinksUser({ page, location, keywords, workplace: { remote, onSite, hybrid }, jobTitle, jobDescription, jobDescriptionLanguages }: PARAMS): AsyncGenerator<[string, string, string]> {
  let numSeenJobs = 0;
  let numMatchingJobs = 0;
  const fWt = [onSite, remote, hybrid].reduce((acc, c, i) => c ? [...acc, i + 1] : acc, [] as number[]).join(',');

  const { geoId, numAvailableJobs } = await getJobSearchMetadata({ page, location, keywords });

  const searchParams: { [key: string]: string } = {
    keywords,
    location,
    start: numSeenJobs.toString(),
    f_WT: fWt,
    f_AL: 'true'
  };

  if(geoId) {
    searchParams.geoId = geoId.toString();
  }

  const url = buildUrl('https://www.linkedin.com/jobs/search', searchParams);

  const jobTitleRegExp = new RegExp(jobTitle, 'i');
  const jobDescriptionRegExp = new RegExp(jobDescription, 'i');

  while (numSeenJobs < numAvailableJobs) {
    url.searchParams.set('start', numSeenJobs.toString());

    await page.goto(url.toString(), { waitUntil: "load" });

    await page.waitForSelector(`${selectors.searchResultListItem}:nth-child(${Math.min(MAX_PAGE_SIZE, numAvailableJobs - numSeenJobs)})`, { timeout: 5000 });

    const jobListings = await page.$$(selectors.searchResultListItem);

    for (let i = 0; i < Math.min(jobListings.length, MAX_PAGE_SIZE); i++) {
      try {
        const [link, title] = await page.$eval(`${selectors.searchResultListItem}:nth-child(${i + 1}) ${selectors.searchResultListItemLink}`, (el) => {
          const linkEl = el as HTMLLinkElement;

          linkEl.click();

          return [linkEl.href.trim(), linkEl.innerText.trim()];
        });

        await page.waitForFunction(async (selectors) => {
          const hasLoadedDescription = !!document.querySelector<HTMLElement>(selectors.jobDescription)?.innerText.trim();
          const hasLoadedStatus = !!(document.querySelector(selectors.easyApplyButtonEnabled) || document.querySelector(selectors.appliedToJobFeedback));

          return hasLoadedStatus && hasLoadedDescription;
        }, {}, selectors);

        const companyName = await page.$eval(`${selectors.searchResultListItem}:nth-child(${i + 1}) ${selectors.searchResultListItemCompanyName}`, el => (el as HTMLElement).innerText).catch(() => 'Unknown');;
        const jobDescription = await page.$eval(selectors.jobDescription, el => (el as HTMLElement).innerText);
        const canApply = !!(await page.$(selectors.easyApplyButtonEnabled));
        const jobDescriptionLanguage = languageDetector.detect(jobDescription, 1)[0][0];
        const matchesLanguage = jobDescriptionLanguages.includes("any") || jobDescriptionLanguages.includes(jobDescriptionLanguage);

        if (canApply && jobTitleRegExp.test(title) && jobDescriptionRegExp.test(jobDescription) && matchesLanguage) {
          numMatchingJobs++;

          yield [link, title, companyName];
        }
      } catch (e) {
        console.log(e);
      }
    }

    await wait(2000);

    numSeenJobs += jobListings.length;
  }
}

export default fetchJobLinksUser;
