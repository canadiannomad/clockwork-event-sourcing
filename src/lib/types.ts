export type LoggerFunction = (...args: any[]) => void;

export interface ClockWorkOptions {
  s3Bucket: string;
  events?: any;
  testMode?: boolean;
  redisConfig?: RedisConfig;
}

export interface RedisConfig {
  host: string;
  password?: string;
  port?: number;
}

export enum EventDirection {
  Incoming = 'INCOMING',
  Outgoing = 'OUTGOING',
}

export interface Event<T> {
  direction: EventDirection;
  source: string;
  sourceVersion: string;
  date: string;
  hops: number;
  cost: string;
  rawPayload: any;
  payload: T;
  stored?: boolean;
}
