import { OutgoingHttpHeaders } from 'http';

export interface PayloadHTTP {
  method: string;
  path: string;
  call: string;
  headers: OutgoingHttpHeaders;
  body: string;
}

export type RequestObject = Record<string, any>;

export interface Request {
  output: RequestObject;
}

export interface SimpleResponse {
  headers: OutgoingHttpHeaders;
  statusCode: number;
  body: string;
}
