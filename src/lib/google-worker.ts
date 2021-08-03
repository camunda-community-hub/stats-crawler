import { ZBClient } from "zeebe-node";
import { StatsResult } from "./types";
import dayjs from "dayjs";

const { GoogleSpreadsheet } = require("google-spreadsheet");

export function startGoogleWorker(zbc: ZBClient) {
  return zbc.createWorker<StatsResult>({
    taskType: "write-google-sheet",
    taskHandler: async job => {
      const { startDate, spreadsheetId, results } = job.variables;
      const { year, month } = dayjs(startDate);
      const spreadsheet = await openSpreadsheet(spreadsheetId);

      await createMissingTabs(spreadsheet, Object.keys(results), [
        "year",
        "month",
        "count",
      ]).catch(console.log);

      results.forEach(async (result) => {
        for (const tabName in result) {
          let sheetIndex = getSheetIndexByTitle(spreadsheet, tabName);
          let count = result[tabName];
          await spreadsheet.sheetsByIndex[sheetIndex].addRow({
            year: year(),
            month: month(),
            count,
          });
        }
      });

      console.log(JSON.stringify(job.variables, null, 2));
      console.log("Posted result to Google Sheets");
      return job.complete();
    }
  });
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
