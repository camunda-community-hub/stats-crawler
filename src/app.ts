import { start, dispatch, spawnStateless, query } from "nact";
import { npmPackageDownloads } from "./lib/npm-actor";
import { statsCollectorActor } from "./lib/statsCollector";
import { makeActor } from "./lib/actor";
import { discourseForumStats } from "./lib/discourse-actor";
import { googleActor } from "./lib/google-actor";
import { envVarReplacer } from "./lib/env-var-replacer";
import schedule from "node-schedule";
import { bootstrapCamundaCloudIntegration } from "./lib/camunda-cloud";
import dotenv from "dotenv";
import configTemplate from "./config.json";

dotenv.config();

const STATS_QUERY = envVarReplacer(configTemplate);

const TIMEOUT_MS = 45000;

export const system = start();

enum Actor {
  npmPackageDownloads = "npmPackageDownloads",
  statsCollector = "statsCollector",
  discourseForumStats = "discourseForumStats",
  googleActor = "googleActor",
}

const statsCollector = spawnStateless(
  system,
  statsCollectorActor,
  Actor.statsCollector
);

spawnStateless(
  statsCollector,
  makeActor(npmPackageDownloads),
  Actor.npmPackageDownloads
);

spawnStateless(
  statsCollector,
  makeActor(discourseForumStats),
  Actor.discourseForumStats
);

const google = spawnStateless(system, googleActor, Actor.googleActor);

// Run at 6am on the second of the month
const rule = new schedule.RecurrenceRule();
rule.date = 2;
rule.hour = 6;
rule.minute = 0;

const SCHEDULE = process.env.SCHEDULE || rule; // "0 0 6 2 *"

const cronjob = schedule.scheduleJob(SCHEDULE, function () {
  query(
    statsCollector,
    (sender) => ({ query: STATS_QUERY, sender }),
    TIMEOUT_MS
  ).then((outcome) =>
    dispatch(google, {
      outcome,
      spreadsheetId: process.env.SPREADSHEET_ID,
    })
  );
});

bootstrapCamundaCloudIntegration({
  statsCollector,
  STATS_QUERY,
  google,
  TIMEOUT_MS,
});
