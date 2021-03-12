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

export interface Request {
  output: any;
}