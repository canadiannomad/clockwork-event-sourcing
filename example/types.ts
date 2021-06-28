import { OutgoingHttpHeaders } from 'http';
import { PayloadHTTPMethod } from '../src/lib/types';

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

export type RequestObject = Record<string, any>;

export interface Request {
  output: RequestObject;
}

export interface SimpleResponse {
  customHeaders?: OutgoingHttpHeaders;
  statusCode: number;
  body: string;
}
