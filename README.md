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

Puppeteer currently publishes a much newer 25.x line; this project has been upgraded from the old 19.x dependency. citeturn3search0

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
