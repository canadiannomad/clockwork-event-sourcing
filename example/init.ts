import { eventqueue, types } from '../src';
import * as events from './events';
import webserver from './webserver';

const options: types.ClockWorkOptions = {
  s3: {
    bucket: 'yourbucket',
    accessKeyId: 'minio',
    secretAccessKey: 'minio123',
    endpoint: 'http://minio:9000',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  },
  events,
  redisConfig: {
    host: 'redis',
    password: '',
    port: 6379,
    prefix: 'cw',
  },
};

const cw = eventqueue(options);

const init = async () => {
  await cw.initializeQueues(events);
  webserver.init(cw);
};

init();
