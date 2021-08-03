import axios from "axios";
import { ZBClient } from "zeebe-node";
import { renamerFactory } from "./renamerFactory";
import { IDiscourseForumQuery, IndividualResult } from "./types";

export function startDiscourseWorker(zbc: ZBClient) {
  return zbc.createWorker<IDiscourseForumQuery, {}, IndividualResult>({
    taskType: "discourse-stat",
    taskHandler: job => {
      const {
        apiKey,
        apiUser,
        endDate,
        forumUrl,
        rename,
        startDate,
      } = job.variables;
      let result = { posts: 0, signups: 0 };

      console.log(`Downloading forum stats for ${forumUrl}`);
      return axios
        .get(forumUrl, {
          headers: {
            "Api-Key": apiKey,
            "Api-Username": apiUser,
            Accept: "application/json",
          },
          params: {
            "reports[posts][start_date]": startDate + "T00:00:00.000Z",
            "reports[posts][end_date]": endDate + "T00:00:00.000Z",
            "reports[signups][start_date]": startDate + "T00:00:00.000Z",
            "reports[signups][end_date]": endDate + "T00:00:00.000Z",
          },
        })
        .then((response) => {
          response.data.reports.forEach((report) => {
            // deepcode ignore PrototypePollution: <please specify a reason of ignoring this>
            result[report.type] = report.data.reduce(
              (acc, item) => acc + item.y,
              0
            );
          });
          const res = renamerFactory(rename)(result);

          return job.complete(res);
        })
        .catch((e) => job.fail(`${forumUrl} - ${e.message}`));
    }
  });
}
