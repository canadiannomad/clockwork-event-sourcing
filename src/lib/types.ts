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
  prefix: string;
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

export enum PayloadHTTPMethod {
  Get = 'GET',
  Post = 'POST',
}

export interface ClockWorkEvent<T> {
  listenFor: string[];
  filterEvent(event: Event<T>): boolean;
  handleStateChange(event: Event<T>);
  handleSideEffects(event: Event<T>);
}
