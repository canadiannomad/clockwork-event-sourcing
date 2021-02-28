import s3 from './s3';
import redis from './redis';
import utils from './utils';
import logger from './logger';

const log = logger('Lib Storage');

const addEvent = async (stream, event) : Promise<any> => {
  log.info(`Adding event to redis ${stream}`);
  event.stored = true;
  let id = await redisAdd(event, stream);
  log.info(`Adding event to S3: events/${stream}/${id}`);
  return await s3.saveJsonFile(`events/${stream}/${id}`, event);
};

const redisAdd = async (event, stream, key: string = '*') : Promise<any> => {
  const kvObj: string[] = utils.objectToKVArray(event, JSON.stringify);
  return await redis.xadd(stream, key, ...kvObj);
};

const getEvent = async (stream, key) : Promise<any> => {
  return await redis.xread('count', 1, 'streams', stream, key);
};

const getStreamEvents = async (stream) : Promise<any> => {
  const events = await redis.xread('count', 0, 'streams', stream, '0');
  if (!events) {
    let s3Events = [];
    s3Events = await getS3Events(stream);
    for (const event of s3Events) {
      await redisAdd(event.file, stream, event.name);
    }
  }
};

const getS3Events = async (folder) : Promise<any> => {
  var fileNames = await s3.listFiles(`events/${folder}`);
  var files = [];
  for (const name of fileNames) {
    var file = await s3.getJsonFile(`events/${folder}/${name}`);
    console.log(JSON.stringify(file));
    files.push({ file, name: name.replace('.json', '') });
  }
  return files;
};

export default {
  addEvent,
  getEvent,
  getStreamEvents,
};
