# LinkedIn Easy Apply Helper

A **human-in-the-loop** helper for preparing LinkedIn Easy Apply applications.

> Important: LinkedIn's current User Agreement prohibits unauthorized bots and automated methods. This project therefore does **not** click the final Submit button. It prepares an application in the browser and stops for your manual review/submission. citeturn0search0turn0search4

## Requirements

- Node.js 20+ recommended
- Chrome/Chromium supplied by Puppeteer
- A LinkedIn account
- Your own CV and optional cover letter

## Install

```bash
npm install
```

If your package manager blocks Puppeteer's browser download:

```bash
npx puppeteer browsers install chrome
```

The repository keeps its existing lockfile-compatible Puppeteer dependency for now; upgrade dependencies only after local testing confirms compatibility.

## Configuration

Copy the sample configuration:

```bash
cp sample_config.ts config.ts
```

Keep `config.ts` private. The repository already ignores it.

Prefer environment variables for credentials:

**Windows PowerShell**

```powershell
$env:LINKEDIN_EMAIL="your-email"
$env:LINKEDIN_PASSWORD="your-password"
npm run start
```

**macOS/Linux**

```bash
LINKEDIN_EMAIL="your-email" LINKEDIN_PASSWORD="your-password" npm run start
```

All other job/application settings remain in `config.ts`.

### Resume-based job profile

The included `sample_config.ts` is configured around the supplied resume and searches broadly for Easy Apply roles related to AI/LLM evaluation, AI training and data work, coding/model evaluation, software QA, search and ads quality, translation, MTPE, localization, transcription, language work, data analysis/validation, annotation, content QA, patent/technical research, and other roles matching those skills. The search is set to India with remote, on-site, and hybrid work enabled.

There is **no salary filter or salary expectation** in the sample configuration. Salary questions are not pre-filled, so they remain available for your review when an employer requires an answer.

## What the program does

1. Opens a visible browser.
2. Logs into LinkedIn.
3. Stops for any CAPTCHA, checkpoint, or verification challenge.
4. Searches according to your configured criteria.
5. Opens matching Easy Apply jobs.
6. Fills fields that match your configured answers.
7. Advances through the application form where possible.
8. Stops when the final application is ready.
9. Leaves the browser open so **you can review and submit manually**.

It never clicks the final Submit button.

LinkedIn says Easy Apply has daily and speed limits and that these measures are intended in part to curb automation and bots. citeturn0search2

## Test the TypeScript

```bash
npm run check
```

## Important

Do not attempt to bypass LinkedIn CAPTCHA, checkpoints, rate limits, access controls, or other security measures. LinkedIn states that unauthorized automated activity can result in account restrictions. citeturn0search4turn0search5
