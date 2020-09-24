import { start, dispatch, spawnStateless, query } from "nact";
import { ZBClient } from "zeebe-node";
import { npmPackageDownloads } from "./lib/npm-actor";
import { statsCollectorActor } from "./lib/statsCollector";
import { makeActor } from "./lib/actor";
import { discourseActorFn } from "./lib/discourse-actor";
import { googleActor } from "./lib/google-actor";
import { envVarReplacer } from "./lib/env-var-replacer";
import fs from "fs";
import path from "path";

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
  makeActor(discourseActorFn),
  Actor.discourseForumStats
);

const google = spawnStateless(statsCollector, googleActor, Actor.googleActor);

const STATS_QUERY = envVarReplacer(
  JSON.parse(fs.readFileSync(path.join(__dirname, `config.json`), "utf-8"))
);

const zbc = new ZBClient();
zbc
  .deployWorkflow("./bpmn/Stats.Collector.bpmn")
  .then(console.log)
  .catch(console.error);

const testWorker = zbc.createWorker({
  taskType: "test-stats-collection",
  taskHandler: async (_, complete) => {
    console.log(__dirname);
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
          spreadsheetId: process.env.TEST_SPREADSHEET_ID,
        });
      })
      .catch((err) => {
        complete.failure(err);
        console.log(err);
      });
  },
});
