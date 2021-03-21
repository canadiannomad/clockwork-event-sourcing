import { eventqueue } from '../src';
import * as events from './events';
import { ClockWorkOptions } from '../src/lib/types';
import webserver from './webserver';

const options: ClockWorkOptions = {
  s3Bucket: 'yourbucket',
  events: events,
  redisConfig: {
    host: '127.0.0.1',
    password: '',
    port: 6379,
    prefix: 'cw',
  },
};

const cw = eventqueue.default(options);

const init = async () => {
  await cw.initializeQueues(events);
  webserver.init(cw);
};

init();
