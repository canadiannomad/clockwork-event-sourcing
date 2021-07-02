import s3 from './s3';
import redis from './redis';
import utils from './utils';
import { Event } from './types';

const redisAdd = async (event: any, stream: string, key = '*'): Promise<any> => {
  const kvObj: string[] = utils.objectToKVArray(event, JSON.stringify);
  return redis.xadd(stream, key, ...kvObj);
};

const addEvent = async (stream: string, event: Event<any>): Promise<any> => {
  console.log('Lib Storage', `Adding event to redis ${stream}`);
  event.stored = true; // eslint-disable-line no-param-reassign
  const id = await redisAdd(event, stream);
  console.log('Lib Storage', `Adding event to S3: events/${stream}/${id}`);

  // Save to S3 asynchronously
  s3.saveJsonFile(`events/${stream}/${id}`, JSON.stringify(event)).catch((_e) => {
    console.error('Lib Storage', 'Saving event failed.');
  });
  return event;
};

type FileRetObject = {
  file: string;
  name: string;
};

const getS3Events = async (folder: string): Promise<FileRetObject[]> => {
  const fileNames = await s3.listFiles(`events/${folder}`);
  const files: FileRetObject[] = [];
  for (const name of fileNames) {
    const file = await s3.getJsonFile(`events/${folder}/${name}`);
    console.log(JSON.stringify(file));
    files.push({ file, name: name.replace('.json', '') });
  }
  return files;
};

const getEvent = async (stream: string, key: string): Promise<string> =>
  redis.xread('count', 1, 'streams', stream, key);

const getEvents = async (stream: string): Promise<any> => {
  const events = await redis.xread('count', 0, 'streams', stream, '0');
  if (!events) {
    let s3Events = [];
    s3Events = await getS3Events(stream);
    for (const event of s3Events) {
      await redisAdd(JSON.parse(event.file), stream, event.name);
    }
  }
};

export default {
  addEvent,
  getEvent,
  getEvents,
};
