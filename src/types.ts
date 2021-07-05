/* eslint-disable @typescript-eslint/no-explicit-any */
export type PayloadType = string;

export interface Event<T> {
  requestId: string;
  date: string;
  payloadType: string;
  payloadVersion: string;
  payload: T;
}

export type EventRecordName = string;

export interface EventRecord {
  name: EventRecordName;
  event: Event<any>;
}

export interface EventObject {
  listenFor: PayloadType[];
  filterEvent(event: Event<any>): Promise<boolean>;
  handleStateChange(event: Event<any>): Promise<void>;
  handleSideEffects(event: Event<any>): Promise<Event<any> | null>;
}

export interface ClusterNode {
  host: string;
  port: number;
}
export interface RedisOptions {
  host: string;
  password?: string;
  port?: number;
  tls?: boolean;
  clusterNodes?: ClusterNode[];
  prefix: string;
}

export interface S3Options {
  bucket: string;
  path?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  s3ForcePathStyle?: boolean;
  signatureVersion?: string;
}

export interface DatalakeOptions {
  s3?: S3Options;
}
export interface StreamsOptions {
  redis?: RedisOptions;
}
export interface StateOptions {
  getCurrentEventRecordName: () => Promise<EventRecordName>;
  setCurrentEventRecordName: (name: EventRecordName) => Promise<void>;
}

export interface Options {
  events: Record<string, EventObject>;
  datalake: DatalakeOptions;
  streams: StreamsOptions;
  state: StateOptions;
}

export interface RedisMessage {
  command: string;
  parameters: string[];
}
