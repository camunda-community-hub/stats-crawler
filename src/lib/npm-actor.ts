import axios from "axios";
import { StatsQueryActorFn } from "./types";

const URL = "https://npm-stat.com/api/download-counts";

interface NpmPackageDownloadsQuery {
  packageName: string;
}

export const npmPackageDownloads: StatsQueryActorFn<NpmPackageDownloadsQuery> = (
  msg
) => {
  const { startDate, endDate } = msg.range;
  const { packageName } = msg.query;
  console.info(`Downloading npm stats for ${packageName}`);
  let result = { downloads: 0 };

  return axios
    .get(URL, {
      headers: {
        Accept: "application/json",
      },
      params: {
        from: startDate.format("YYYY-MM-DD"),
        until: endDate.format("YYYY-MM-DD"),
        package: packageName,
      },
    })
    .then((response) => {
      let sum = 0;

      for (const date in response.data[packageName]) {
        sum += response.data[packageName][date];
      }

      result.downloads = sum;

      return result;
    });
};
