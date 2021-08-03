export interface IStatsCollectorConfig {
  npmPackageDownloads: INpmPackageConfig[];
  discourseForumStats: IDiscourseForumConfig[];
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export interface IStatsCollectorQuery extends IStatsCollectorConfig, DateRange {
  spreadsheetId: string;
}

export interface INpmPackageQuery extends DateRange {
  npmPackageDownload: INpmPackageConfig
}

export interface IDiscourseForumQuery extends DateRange {
  discourseForumStat: IDiscourseForumConfig 
} 


export interface INpmPackageConfig {
  packageName: string;
  rename: {
    downloads: string;
  };
}

export interface IDiscourseForumConfig {
  forumUrl: string;
  apiKey: string;
  apiUser: string;
  rename: {
    posts: string;
    signups: string;
  };
}

export interface IndividualResult {
  [key: string]: string;
}

export interface StatsResult extends IStatsCollectorQuery {
  results: IndividualResult[];
}
