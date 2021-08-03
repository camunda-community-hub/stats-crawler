import axios from "axios";
import { ZBClient } from "zeebe-node";
import { renamerFactory } from "./renamerFactory";
import { IndividualResult, INpmPackageQuery } from "./types";

const URL = "https://npm-stat.com/api/download-counts";

export function startNpmWorker(zbc: ZBClient) {
  return zbc.createWorker<INpmPackageQuery, {}, IndividualResult>({
    taskType: "npm-stat",
    taskHandler: job => {
      const { packageName, rename, endDate, startDate } = job.variables;
      console.info(`Downloading npm stats for ${packageName}`);
      let result = { downloads: 0 };

      return axios
        .get(URL, {
          headers: {
            Accept: "application/json",
          },
          params: {
            from: startDate,
            until: endDate,
            package: packageName,
          },
        })
        .then(response => {
          let sum = 0;

          for (const date in response.data[packageName]) {
            sum += response.data[packageName][date];
          }

          result.downloads = sum;
          const res = renamerFactory(rename)(result);

          return job.complete(res);
        })
        .catch(e => job.fail(`${packageName} - ${e.message}`));
    }
  });
}
