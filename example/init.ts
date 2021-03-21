import { eventqueue, types } from '../src';
import * as events from './events';
import webserver from './webserver';

const options: types.ClockWorkOptions = {
  s3Bucket: 'yourbucket',
  events: events,
  redisConfig: {
    host: '127.0.0.1',
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
