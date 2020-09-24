import { query, dispatch } from "nact";
import { ZBClient } from "zeebe-node";
import path from "path";

export function bootstrapCamundaCloudIntegration({
  statsCollector,
  STATS_QUERY,
  google,
  TIMEOUT_MS,
}) {
  const zbc = new ZBClient();
  zbc
    .deployWorkflow([
      path.join(__dirname, "..", "..", "bpmn", "Stats.Collector.bpmn"),
      path.join(__dirname, "..", "..", "bpmn", "Stats.Collector.Test.bpmn"),
    ])
    .then(console.log)
    .catch(console.error);

  const handlerFactory = (spreadsheetId) => (_, complete) => {
    query(
      statsCollector,
      (sender) => ({ query: STATS_QUERY, sender }),
      TIMEOUT_MS
    )
      .then((res) => {
        complete.success(res);
        console.log("Posted results to Zeebe");
        dispatch(google, {
          outcome: res,
          spreadsheetId,
        });
      })
      .catch((err) => {
        complete.failure(err);
        console.log(err);
      });
  };

  const testWorker = zbc.createWorker({
    taskType: "stats-collection-test",
    taskHandler: handlerFactory(process.env.TEST_SPREADSHEET_ID),
  });

  const executeWorker = zbc.createWorker({
    taskType: "stats-collection",
    taskHandler: handlerFactory(process.env.TEST_SPREADSHEET),
  });
}
