import puppeteer from "puppeteer";

import config from "../sample_config";
import login from "../login";
import apply, { ApplicationFormData } from "../apply";
import fetchJobLinksUser from "../fetch/fetchJobLinksUser";

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const getConfigValue = (name: string, fallback: string): string =>
  process.env[name] ?? fallback;

const email = getConfigValue("LINKEDIN_EMAIL", config.LINKEDIN_EMAIL);
const password = getConfigValue("LINKEDIN_PASSWORD", config.LINKEDIN_PASSWORD);

if (!email || !password) {
  throw new Error("Set LINKEDIN_EMAIL and LINKEDIN_PASSWORD as environment variables.");
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: false,
    args: ["--disable-setuid-sandbox", "--no-sandbox"]
  });

  try {
    const browserAny = browser as any;
    const context = browserAny.createBrowserContext
      ? await browserAny.createBrowserContext()
      : await browserAny.createIncognitoBrowserContext();
    const listingPage = await context.newPage();

    await login({ page: listingPage, email, password });

    const linkGenerator = fetchJobLinksUser({
      page: listingPage,
      location: config.LOCATION,
      keywords: config.KEYWORDS,
      workplace: {
        remote: config.WORKPLACE.REMOTE,
        onSite: config.WORKPLACE.ON_SITE,
        hybrid: config.WORKPLACE.HYBRID,
      },
      jobTitle: config.JOB_TITLE,
      jobDescription: config.JOB_DESCRIPTION,
      jobDescriptionLanguages: config.JOB_DESCRIPTION_LANGUAGES
    });

    let applicationPage = await context.newPage();

    for await (const [link, title, companyName] of linkGenerator) {
      if (process.env.SINGLE_PAGE !== "true") {
        applicationPage = await context.newPage();
      }

      await applicationPage.bringToFront();

      try {
        const formData: ApplicationFormData = {
          phone: config.PHONE,
          cvPath: config.CV_PATH,
          homeCity: config.HOME_CITY,
          coverLetterPath: config.COVER_LETTER_PATH,
          yearsOfExperience: config.YEARS_OF_EXPERIENCE,
          languageProficiency: config.LANGUAGE_PROFICIENCY,
          requiresVisaSponsorship: config.REQUIRES_VISA_SPONSORSHIP,
          booleans: config.BOOLEANS,
          textFields: config.TEXT_FIELDS,
          multipleChoiceFields: config.MULTIPLE_CHOICE_FIELDS,
        };

        await apply({ page: applicationPage, link, formData });
        console.log(`Prepared: ${title} at ${companyName}`);
      } catch (error) {
        console.log(`Could not prepare ${title} at ${companyName}:`, error);
      }

      await listingPage.bringToFront();
      await wait(1500);
    }
  } finally {
    console.log("\nBrowser left open. Close it manually when finished.");
  }
})();
