import dayjs from "dayjs";
import { ZBClient } from "zeebe-node";
import { envVarReplacer } from "./env-var-replacer";
import { IStatsCollectorQuery } from "./types";
import configTemplate from "../config.json";

const STATS_QUERY = envVarReplacer(configTemplate);

export function startGetQueryWorker(
  zbc: ZBClient,
  spreadsheetIds: {
    testSheet: string;
    prodSheet: string;
  }
) {
  return zbc.createWorker<{ test?: boolean }, {}, IStatsCollectorQuery>(
    "get-query",
    (job, complete) => {
      const startDate = dayjs().subtract(1, "month").startOf("month");
      const endDate = startDate.endOf("month").format("YYYY-MM-DD");

      complete.success({
        ...STATS_QUERY,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate,
        spreadsheetId: job.variables.test
          ? spreadsheetIds.testSheet
          : spreadsheetIds.prodSheet,
      });
    }
  );
}
