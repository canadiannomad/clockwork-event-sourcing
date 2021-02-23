import s3 from './s3';
import redis from './redis';
import utils from './utils';
import logger from './logger';

const log = logger('Lib Storage');

const addEvent = async (content) => {
  let id = await redisAdd(content);
  await s3.saveJsonFile(`events/${id}`, content);
};

const redisAdd = async (content) => {
  const kvObj: string[] = utils.objectToKVArray(content, JSON.stringify);
  log.info(`Sending to queue minevtsrc-stream-${outputPayloadType}`);
  return await redis.xadd(`minevtsrc-stream-${outputPayloadType}`, '*', ...kvObj);
};

const getEvent = async (stream, key) => {
  return await redis.xread('count', 1, 'streams', stream, key);
};

const listStreamEvents = async (stream) => {
//   const events = await redis.xread('count', 0, 'streams', stream, '0');
//   if (events.length == 0) {
//       // to get s3 list of files need to be in pages of 1,000
//   }
};

export default {
  addEvent,
  getEvent,
  listEvents,
};
