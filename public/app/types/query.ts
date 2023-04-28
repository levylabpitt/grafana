import { DataQuery, DataSourceRef, TimeBucket } from '@grafana/data';

export interface QueryGroupOptions {
  queries: DataQuery[];
  dataSource: QueryGroupDataSource;
  maxDataPoints?: number | null;
  minInterval?: string | null;
  cacheTimeout?: string | null;
  queryCachingTTL?: number | null;
  timeRange?: {
    from?: string | null;
    shift?: string | null;
    hide?: boolean;
  };
  timeBucket?: TimeBucket;
}

export interface QueryGroupDataSource extends DataSourceRef {
  name?: string | null;
  default?: boolean;
}
