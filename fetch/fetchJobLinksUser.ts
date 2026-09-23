import { Page } from 'puppeteer';
import LanguageDetect from 'languagedetect';

import buildUrl from '../utils/buildUrl';
import wait from '../utils/wait';
import selectors from '../selectors';

const MAX_PAGE_SIZE = 7;
const MAX_SEARCH_PAGES = 100;
const languageDetector = new LanguageDetect();

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
 * Fetches Easy Apply job links as a logged-in user.
 *
 * LinkedIn's current /jobs/ home page can present an AI/recommendations
 * landing page without the legacy keyword/location search form. To avoid
 * depending on that UI, navigate directly to the jobs/search endpoint.
 */
async function* fetchJobLinksUser({
  page,
  location,
  keywords,
  workplace: { remote, onSite, hybrid },
  jobTitle,
  jobDescription,
  jobDescriptionLanguages
}: PARAMS): AsyncGenerator<[string, string, string]> {
  const fWt = [onSite, remote, hybrid]
    .reduce((acc, enabled, index) => enabled ? [...acc, index + 1] : acc, [] as number[])
    .join(',');

  const searchParams: { [key: string]: string } = {
    keywords,
    location,
    start: '0',
    f_WT: fWt,
    f_AL: 'true'
  };

  const searchUrl = buildUrl('https://www.linkedin.com/jobs/search', searchParams);

  const jobTitleRegExp = new RegExp(jobTitle, 'i');
  const jobDescriptionRegExp = new RegExp(jobDescription, 'i');

  let numSeenJobs = 0;

  for (let pageNumber = 0; pageNumber < MAX_SEARCH_PAGES; pageNumber++) {
    searchUrl.searchParams.set('start', numSeenJobs.toString());

    await page.goto(searchUrl.toString(), { waitUntil: 'load' });
    console.log(`Job search page loaded: ${page.url()}`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const jobListings = await page.$$(selectors.searchResultListItem);

    if (jobListings.length === 0) {
      console.log('No job listings found; ending job search.');
      break;
    }

    const batchSize = Math.min(jobListings.length, MAX_PAGE_SIZE);
    console.log(`Found ${jobListings.length} job listings; processing ${batchSize}.`);

    const candidates: Array<[string, string, string]> = [];

    for (let i = 0; i < batchSize; i++) {
      try {
        const candidate = await page.$eval(
          `${selectors.searchResultListItem}:nth-child(${i + 1})`,
          (el) => {
            const linkEl = el.querySelector<HTMLAnchorElement>(`a.job-card-list__title, a[href*="/jobs/view/"]`);
            const titleEl = linkEl || el.querySelector<HTMLElement>('a');
            const companyEl = el.querySelector<HTMLElement>(
              'div.job-card-container__company-name, a.job-card-container__company-name, .artdeco-entity-lockup__subtitle'
            );

            return [
              linkEl?.href?.trim() || '',
              titleEl?.innerText?.trim() || '',
              companyEl?.innerText?.trim() || 'Unknown'
            ];
          }
        );

        if (candidate[0] && candidate[1]) {
          candidates.push(candidate);
        }
      } catch (error) {
        console.log('Could not read job listing:', error);
      }
    }

    for (const [link, title, companyName] of candidates) {
      try {
        await page.goto(link, { waitUntil: 'load' });

        await page.waitForFunction(
          (selectors) => {
            const hasLoadedDescription = !!document.querySelector<HTMLElement>(selectors.jobDescription)?.innerText.trim();
            const hasLoadedStatus = !!(
              document.querySelector(selectors.easyApplyButtonEnabled) ||
              document.querySelector(selectors.appliedToJobFeedback)
            );

            return hasLoadedStatus && hasLoadedDescription;
          },
          { timeout: 10000 },
          selectors
        );

        const descriptionEl = await page.$(selectors.jobDescription);
        if (!descriptionEl) {
          continue;
        }

        const description = await descriptionEl.evaluate(el => (el as HTMLElement).innerText);
        const canApply = !!(await page.$(selectors.easyApplyButtonEnabled));
        const detected = languageDetector.detect(description, 1);
        const jobDescriptionLanguage = detected.length > 0 ? detected[0][0] : '';
        const matchesLanguage =
          jobDescriptionLanguages.includes('any') ||
          jobDescriptionLanguages.includes(jobDescriptionLanguage);

        if (
          canApply &&
          jobTitleRegExp.test(title) &&
          jobDescriptionRegExp.test(description) &&
          matchesLanguage
        ) {
          yield [link, title, companyName];
        }
      } catch (error) {
        console.log(`Could not inspect ${title} at ${companyName}:`, error);
      }
    }

    numSeenJobs += batchSize;
    await wait(1500);
  }
}

export default fetchJobLinksUser;
