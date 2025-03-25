declare module 'google-trends-api' {
  interface TrendsOptions {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
  }

  function interestOverTime(options: TrendsOptions): Promise<string>;
  function relatedTopics(options: TrendsOptions): Promise<string>;
  function relatedQueries(options: TrendsOptions): Promise<string>;
  function dailyTrends(options: TrendsOptions): Promise<string>;
  function realTimeTrends(options: TrendsOptions): Promise<string>;

  export {
    interestOverTime,
    relatedTopics,
    relatedQueries,
    dailyTrends,
    realTimeTrends,
  };
} 