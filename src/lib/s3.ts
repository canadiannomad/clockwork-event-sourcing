import './types';
import { S3 } from 'aws-sdk/clients/all'
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import logger from './logger';

const log = logger('S3');
const s3 = new S3();

/**
 * This function saves a text file into a S3 bucket.
 * @param {string}  name - The file name.
 * @param {string}  content - The file content.
 * @return {Promise<any>} Promise that returns the S3 response.
 */
const saveJsonFile = async (name: string, content: string): Promise<any> => {
  const putObject: PutObjectRequest = {
    Bucket: globalThis.s3Bucket,
    Body: JSON.stringify(content),
    Key: `${name}.json`,
  };
  log.info(`Saving file ${name}`, {putObject});
  try {
    if(!globalThis.testMode){
      await s3.putObject(putObject).promise();
      log.info('Saved file:', { name });
    }
  } catch (e) {
    log.info('Failed to save the file:', { name, e });
    process.exit(1);
    return e;
  }
};

/**
 * This function gets a file from S3 bucket.
 * @param {string}  name - The file name.
 * @return {Promise<any>} Promise that returns the file content.
 */
const getJsonFile = async (name: string): Promise<any> => {
  var request: S3.GetObjectRequest = {
    Bucket: globalThis.s3Bucket,
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

export {
  saveJsonFile,
  getJsonFile
};