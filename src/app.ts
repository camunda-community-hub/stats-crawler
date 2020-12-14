import schedule from "node-schedule";
import dotenv from "dotenv";
import { ZBClient } from "zeebe-node";
import path from "path";
import { startGetQueryWorker } from "./lib/get-query";
import { startDiscourseWorker } from "./lib/discourse-worker";
import { startGoogleWorker } from "./lib/google-worker";
import { startNpmWorker } from "./lib/npm-worker";

dotenv.config();

// Run at 6am on the second of the month
const rule = new schedule.RecurrenceRule();
rule.date = 2;
rule.hour = 6;
rule.minute = 0;

const SCHEDULE = process.env.SCHEDULE || rule; // "0 0 6 2 *"

const zbc = new ZBClient();

schedule.scheduleJob(SCHEDULE, function () {
  zbc
    .createWorkflowInstance("run-stats-collector", { test: false })
    .then(console.log);
});

zbc
  .deployWorkflow(
    path.join(__dirname, "..", "..", "bpmn", "Stats.Collector.v2.bpmn")
  )
  .then(console.log)
  .catch(console.error);

startGetQueryWorker(zbc, {
  testSheet: process.env.TEST_SPREADSHEET_ID!,
  prodSheet: process.env.SPREADSHEET_ID!,
});
startDiscourseWorker(zbc);
startGoogleWorker(zbc);
startNpmWorker(zbc);
