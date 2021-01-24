import './types';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import logger from './logger';

const log = logger('S3');
const s3 = new S3();
const bucket = globalThis.s3Bucket;

/**
 * This function saves a text file into a S3 bucket.
 * @param {string}  name - The file name.
 * @param {string}  content - The file content.
 * @return {Promise<any>} Promise that returns the S3 response.
 */
const saveTextFile = async (name: string, content: string): Promise<any> => {
  const object: PutObjectRequest = {
    Bucket: bucket,
    Body: JSON.stringify(content),
    Key: name,
  };

  try {
    const retVal = await s3.putObject(object).promise();
    log.info('Saved file:', { name });
    return JSON.parse(retVal as any);
  } catch (e) {
    log.info('Failed to save the file:', { name, e });
    return e;
  }
};

/**
 * This function gets a file from S3 bucket.
 * @param {string}  name - The file name.
 * @return {Promise<any>} Promise that returns the file content.
 */
const getFile = async (name: string): Promise<any> => {
  var request: S3.GetObjectRequest = {
    Bucket: bucket,
    Key: name,
  };

  try {
    const retVal = await s3.getObject(request).promise();
    log.info('Got file:', { name });
    return JSON.parse(retVal as any);
  } catch (e) {
    log.info('Failed to get the file:', { name, e });
    return e;
  }
};

export default {
  saveTextFile: saveTextFile,
  getFile: saveTextFile,
};
