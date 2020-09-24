import { start, dispatch, spawnStateless, spawn } from "nact";
import { ZBClient } from "zeebe-node";
import { npmPackageDownloads } from "./lib/npm-actor";
import { MessageType } from "./lib/types";
import { statsCollectorActor } from "./lib/statsCollector";
import { makeActor } from "./lib/actor";
import { discourseActorFn } from "./lib/discourse-actor";
import { reportingActor } from "./lib/reporting-actor";
import { envVarReplacer } from "./lib/env-var-replacer";

export const system = start();

enum Actor {
  npmPackageDownloads = "npmPackageDownloads",
  statsCollector = "statsCollector",
  discourseForumStats = "discourseForumStats",
  reportingActor = "reportingActor",
}

const statsCollector = spawn(system, statsCollectorActor, Actor.statsCollector);

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

spawnStateless(statsCollector, reportingActor, Actor.reportingActor);

const STATS_QUERY = envVarReplacer(require("./config.json"));

dispatch(statsCollector, {
  type: MessageType.QUERY,
  query: STATS_QUERY,
});

// const zbc = new ZBClient();
// zbc
//   .deployWorkflow("./bpmn/Stats.Collector.bpmn")
//   .then(console.log)
//   .catch(console.error);

// const testWorker = zbc.createWorker({
//   taskType: 'test-stats-collection',
//   taskHandler: (job, complete) => {
//     dispatch(statsCollector, {
//       type: MessageType.QUERY_TEST,
//       query: STATS_QUERY,
//     });
//   }
// })
