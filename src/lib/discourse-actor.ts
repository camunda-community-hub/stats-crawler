import axios from "axios";
import { StatsQueryActorFn } from "./types";

interface DiscourseForumQuery {
  forumUrl: string;
  apiKey: string;
  apiUser: string;
}

export const discourseActorFn: StatsQueryActorFn<DiscourseForumQuery> = async (
  msg
) => {
  const { startDate, endDate } = msg.range;
  const { forumUrl, apiKey, apiUser } = msg.query;
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
        "reports[posts][start_date]":
          startDate.format("YYYY-MM-DD") + "T00:00:00.000Z",
        "reports[posts][end_date]":
          endDate.format("YYYY-MM-DD") + "T00:00:00.000Z",
        "reports[signups][start_date]":
          startDate.format("YYYY-MM-DD") + "T00:00:00.000Z",
        "reports[signups][end_date]":
          endDate.format("YYYY-MM-DD") + "T00:00:00.000Z",
      },
    })
    .then((response) => {
      response.data.reports.forEach((report) => {
        result[report.type] = report.data.reduce(
          (acc, item) => acc + item.y,
          0
        );
      });

      return result;
    });
};
