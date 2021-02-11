export type LoggerFunction = (...args: any[]) => void;

export interface ClockWorkOptions {
  s3Bucket: string;
  events?: any;
  testMode?: boolean;
  redisConfig?: RedisConfig;
}

export interface RedisConfig {
  host: string;
  password: string;
  port: string;
}

export enum EventDirection {
  Incoming = 'INCOMING',
  Outgoing = 'OUTGOING',
}

export enum PayloadHTTPMethod {
  Get = 'GET',
  Post = 'POST',
}

export interface Payload {
  payloadType: string;
  payloadVersion: string;
}

export interface PayloadHTTP extends Payload {
  requestId: string;
  method: PayloadHTTPMethod;
  validatedUser?: string;
  path: string;
  call?: string;
  parameters: any;
  body: any;
}

export interface StateExample {
  example: string[];
}
export interface Event<T extends Payload> {
  direction: EventDirection;
  source: string;
  sourceVersion: string;
  date: string;
  hops: number;
  cost: string;
  rawPayload: any;
  payload: T;
}

export interface Request {
  output: any;
}
