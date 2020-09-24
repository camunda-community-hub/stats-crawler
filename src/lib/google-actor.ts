import { ActorContext, ActorSystemRef } from "nact";
const { GoogleSpreadsheet } = require("google-spreadsheet");

export const googleActor = async (
  msg: any,
  _: ActorContext<any, ActorSystemRef>
) => {
  const { outcome, spreadsheetId } = msg;
  const spreadsheet = await openSpreadsheet(spreadsheetId);

  await createMissingTabs(spreadsheet, Object.keys(outcome.results), [
    "year",
    "month",
    "count",
  ]).catch(console.log);

  for (const tabName in outcome.results) {
    let sheetIndex = getSheetIndexByTitle(spreadsheet, tabName);
    let count = outcome.results[tabName];
    await spreadsheet.sheetsByIndex[sheetIndex].addRow({
      year: msg.outcome.startDate.year,
      month: msg.outcome.startDate.month,
      count: count,
    });
  }

  console.log(JSON.stringify(msg, null, 2));
  console.log("Posted result to Google Sheets");
};

async function openSpreadsheet(docId) {
  const spreadsheet = new GoogleSpreadsheet(docId);

  await spreadsheet
    .useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    })
    .catch(console.log);
  await spreadsheet.loadInfo().catch(console.log);

  return spreadsheet;
}

function getSheetIndexByTitle(spreadsheet, title) {
  const filteredSheets = spreadsheet.sheetsByIndex.filter(
    (sheet) => sheet.title === title
  );

  if (filteredSheets.length == 0) {
    return null;
  } else {
    return filteredSheets[0].index;
  }
}

async function createMissingTabs(spreadsheet, tabNames, headerValues) {
  tabNames.map(async (title) => {
    let sheetIndex = getSheetIndexByTitle(spreadsheet, title);

    if (sheetIndex === null) {
      await spreadsheet.addSheet({ title, headerValues });
    }
  });
}
