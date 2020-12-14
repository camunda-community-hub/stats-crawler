import { ZBClient } from "zeebe-node";
import { StatsResult } from "./types";
import dayjs from "dayjs";

const { GoogleSpreadsheet } = require("google-spreadsheet");

export function startGoogleWorker(zbc: ZBClient) {
  return zbc.createWorker<StatsResult>(
    "write-google-sheet",
    async (job, complete) => {
      const outcome = job.variables;
      const startDate = dayjs(outcome.startDate);
      const spreadsheet = await openSpreadsheet(outcome.spreadsheetId);

      await createMissingTabs(spreadsheet, Object.keys(outcome.results), [
        "year",
        "month",
        "count",
      ]).catch(console.log);

      outcome.results.forEach(async (result) => {
        for (const tabName in result) {
          let sheetIndex = getSheetIndexByTitle(spreadsheet, tabName);
          let count = result[tabName];
          await spreadsheet.sheetsByIndex[sheetIndex].addRow({
            year: startDate.year,
            month: startDate.month,
            count,
          });
        }
      });

      console.log(JSON.stringify(outcome, null, 2));
      console.log("Posted result to Google Sheets");
      complete.success();
    }
  );
}

async function openSpreadsheet(docId) {
  const spreadsheet = new GoogleSpreadsheet(docId);

  await spreadsheet
    .useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.split("\\n").join("\n"),
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
