export type LoggerFunction = (...args: any[]) => void;

export interface S3Config {
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  s3ForcePathStyle?: boolean;
  signatureVersion?: string;
}

export interface RedisConfig {
  host: string;
  password?: string;
  port?: number;
  tls?: boolean;
  cluster?: boolean;
  prefix: string;
}

export interface ClockWorkOptions {
  s3: S3Config;
  events?: any;
  testMode?: boolean;
  redisConfig?: RedisConfig;
}

export enum EventDirection { // eslint-disable-line no-shadow
  Incoming = 'INCOMING',
  Outgoing = 'OUTGOING',
}

export interface Event<T> {
  direction: EventDirection;
  source: string;
  sourceVersion: string;
  date: string;
  hops: number;
  cost?: string;
  rawPayload: any;
  payload: T;
  stored?: boolean;
}

export enum PayloadHTTPMethod { // eslint-disable-line no-shadow
  Get = 'GET',
  Post = 'POST',
}

export interface ClockWorkEvent<T> {
  listenFor: string[];
  filterEvent(event: Event<T>): boolean;
  handleStateChange(event: Event<T>);
  handleSideEffects(event: Event<T>);
}

export interface ClockWorkObject {
  initializeQueues(evts: any): Promise<void>;
  send(funcName: string, event: Event<any>): Promise<any>;
}
