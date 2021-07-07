import S3 from 'aws-sdk/clients/s3';
import * as types from '../types';
import conf from './config';
import redis from './redis';

let nonce = 0;
const timer = setInterval(() => {
  nonce = 0;
}, 1000);

const getS3Config = () => {
  const s3Config = conf.get().datalake?.s3;
  if (!s3Config) throw new Error('S3 Not Configured');
  s3Config.path = s3Config.path || 'events';
  return s3Config;
};
const getS3Object = (): S3 => new S3(getS3Config());

const storeToS3 = async (eventName: types.EventRecordName, body: string) => {
  const { bucket } = getS3Config();
  const putObject: S3.Types.PutObjectRequest = {
    Bucket: bucket,
    Body: body,
    Key: `${getS3Config().path}/${eventName}.json`,
  };
  try {
    await getS3Object().putObject(putObject).promise();
    console.log('S3', 'Saved file:', { eventName });
  } catch (e) {
    console.error('S3', 'Failed to save the file:', { eventName, e });
  }
};

const saveEvent = async (event: types.Event<any>): Promise<types.EventRecordName> => {
  const redisPrefix = conf.get().streams?.redis?.prefix || 'cwesf';
  const uts: number = new Date().getTime();
  nonce += 1;
  const newEventRecordName: types.EventRecordName = `${uts}-${nonce}`;
  const eventString = JSON.stringify(event);
  const cachedEventKey = `${redisPrefix}-s3cache-${newEventRecordName}`;
  storeToS3(cachedEventKey, eventString);
  await redis.set(cachedEventKey, eventString);
  return newEventRecordName;
};

const getEvent = async (eventName: types.EventRecordName): Promise<types.Event<any>> => {
  const redisPrefix = conf.get().streams?.redis?.prefix || 'cwesf';
  const cachedEventKey = `${redisPrefix}-s3cache-${eventName}`;
  const cachedEvent = await redis.get(cachedEventKey);
  if (cachedEvent) {
    return JSON.parse(cachedEvent) as types.Event<any>;
  }
  const request: S3.GetObjectRequest = {
    Bucket: getS3Config().bucket,
    Key: `${getS3Config().path}/${eventName}`,
  };

  try {
    const retVal = await getS3Object().getObject(request).promise();
    const data = (retVal.Body || '').toString('utf-8');
    console.log('S3', 'Got file:', { eventName });
    redis.set(cachedEventKey, data);
    return JSON.parse(data) as types.Event<any>;
  } catch (e) {
    console.log('S3', 'Failed to get the file:', { eventName, e });
    throw e;
  }
};

const getNextEventRecordAfter = async (currentRecordName: types.EventRecordName): Promise<types.EventRecord | null> => {
  const { bucket } = getS3Config();
  if (!bucket) throw new Error('S3 Bucket not defined');
  console.log('S3', `Listing records starting from "${currentRecordName}"`);
  const folder = `${getS3Config().path}/`;
  const request: S3.Types.ListObjectsV2Request = {
    Bucket: bucket,
    Delimiter: '/',
    Prefix: folder,
    MaxKeys: 1,
    StartAfter: `${folder}${currentRecordName}`,
  };
  const retVal = await getS3Object().listObjectsV2(request).promise();
  const contents = retVal?.Contents?.[0];
  if (!contents || !contents.Key) return null;
  const fileName: types.EventRecordName = contents.Key.replace(`${folder}`, '');

  if (fileName.startsWith('.') || !fileName.endsWith('.json')) return getNextEventRecordAfter(fileName);

  return {
    name: fileName,
    event: await getEvent(fileName),
  };
};
const getFirstEventRecord = async (): Promise<types.EventRecord | null> => {
  const { bucket } = getS3Config();
  if (!bucket) throw new Error('S3 Bucket not defined');
  console.log('S3', `Getting first record.`);
  const folder = `${getS3Config().path}/`;
  const request: S3.Types.ListObjectsV2Request = {
    Bucket: bucket,
    Delimiter: '/',
    Prefix: folder,
    MaxKeys: 1,
  };
  const retVal = await getS3Object().listObjectsV2(request).promise();
  const contents = retVal?.Contents?.[0];
  if (!contents || !contents.Key) return null;
  const fileName: types.EventRecordName = contents.Key.replace(`${folder}`, '');

  if (fileName.startsWith('.') || !fileName.endsWith('.json')) return getNextEventRecordAfter(fileName);

  return {
    name: fileName,
    event: await getEvent(fileName),
  };
};

const flushEvents = async (): Promise<void> => {
  const { bucket, path } = getS3Config();
  if (!bucket) throw new Error('S3 Bucket not defined');
  let record = await getFirstEventRecord();
  while (record !== null) {
    try {
      const filename = record?.name;
      if (!filename) continue; // eslint-disable-line no-continue
      const request: S3.Types.DeleteObjectRequest = {
        Bucket: bucket,
        Key: `${path}/${filename}`,
      };
      await getS3Object().deleteObject(request).promise();
      record = await getNextEventRecordAfter(filename);
    } catch (error) {
      throw new Error(`Error deleting file ${record?.name}`);
    }
  }
};

const stop = (): void => {
  clearInterval(timer);
};

export default {
  saveEvent,
  getEvent,
  getFirstEventRecord,
  getNextEventRecordAfter,
  flushEvents,
  stop,
};
