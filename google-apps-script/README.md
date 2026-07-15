# Google Apps Script Sheet Endpoint

Use this script to make the Google Sheet a reliable live JSON source for the RET Industry Partner Directory.

1. Open [script.google.com](https://script.google.com/) and create a new Apps Script project.
2. Replace the starter code with `Code.gs` from this folder.
3. Click **Deploy** > **New deployment**.
4. Choose **Web app**.
5. Set **Execute as** to **Me**.
6. Set **Who has access** to **Anyone** or **Anyone with the link**.
7. Deploy and copy the web app URL.
8. Send that URL back to Codex so it can be added to `APPS_SCRIPT_JSON_URL` in `app/page.tsx` and republished.

The script returns only the sheet rows as JSON. It does not let teachers edit the sheet.
