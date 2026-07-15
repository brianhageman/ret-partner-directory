const SPREADSHEET_ID = "1dKMkOsVlfuLRnw4qHnT757E1tQa8Qfm3m-Srh6iv-JM";
const SHEET_NAME = "Partner Database";

function doGet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift();

  const partners = values
    .filter((row) => row.some((cell) => String(cell).trim()))
    .map((row, index) => {
      const record = { id: `partner-${index + 1}` };
      headers.forEach((header, columnIndex) => {
        record[header] = row[columnIndex] || "";
      });
      return record;
    })
    .filter((record) => record["Organization Name"]);

  return ContentService
    .createTextOutput(JSON.stringify({ partners }))
    .setMimeType(ContentService.MimeType.JSON);
}
