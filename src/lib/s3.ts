import { S3 } from 'aws-sdk/clients/all';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import config from './config';

const getS3Object = (): S3 => {
  const s3Config = config.getConfiguration().s3;
  return new S3(s3Config);
};

/**
 * This function saves a text file into a S3 bucket.
 * @param {string}  name - The file name.
 * @param {string}  content - The file content.
 * @return {Promise<any>} Promise that returns the S3 response.
 */
const saveJsonFile = async (name: string, content: string): Promise<any> => {
  const { bucket } = config.getConfiguration().s3;
  const { testMode } = config.getConfiguration();
  const putObject: PutObjectRequest = {
    Bucket: bucket,
    Body: JSON.stringify(content),
    Key: `${name}.json`,
  };
  try {
    if (!testMode) {
      await getS3Object().putObject(putObject).promise();
      console.log('S3', 'Saved file:', { name });
    }
  } catch (e) {
    console.log('S3', 'Failed to save the file:', { name, e });
    throw e;
  }
};

/**
 * This function gets a file from S3 bucket.
 * @param {string}  name - The file name.
 * @return {Promise<any>} Promise that returns the file content.
 */
const getJsonFile = async (name: string): Promise<any> => {
  const { bucket } = config.getConfiguration().s3;
  const request: S3.GetObjectRequest = {
    Bucket: bucket,
    Key: name,
  };

  try {
    const retVal = await getS3Object().getObject(request).promise();
    const data = retVal.Body.toString('utf-8');
    console.log('S3', 'Got file:', { name });
    return JSON.parse(data as any);
  } catch (e) {
    console.log('S3', 'Failed to get the file:', { name, e });
    throw e;
  }
};

/**
 * Returns the file list on a folder.
 * @param {string}  folder - The folder name.
 * @param {string}  continuationToken - The continuation token.
 * @return {Promise<any>} Promise that returns the folder files list.
 */
const listFiles = async (folder: string, continuationToken: string = null): Promise<any> => {
  try {
    let result = [];
    const { bucket } = config.getConfiguration().s3;
    const request = {
      Bucket: bucket,
      Prefix: `${folder}/`,
      ContinuationToken: continuationToken,
    };

    console.log('S3', `Getting files from ${folder}, ${continuationToken}`, bucket);

    const retVal = await getS3Object().listObjectsV2(request).promise();
    if (retVal.Contents?.length > 0) {
      const files = retVal.Contents.map((file) => file.Key.replace(`${folder}/`, ''));
      result = result.concat(files);
    }
    if (retVal?.IsTruncated) {
      const recursiveFilesResponse = await listFiles(folder, retVal.NextContinuationToken);
      if (recursiveFilesResponse?.length > 0) {
        result = result.concat(recursiveFilesResponse);
      }
    }
    return result;
  } catch (e) {
    console.error('S3', `Failed to get the folder content: ${folder}`, { e });
    throw e;
  }
};

const uploadBlobFile = async (folder: string, fileName: string, blob: Buffer): Promise<void> => {
  const { bucket } = config.getConfiguration().s3;
  const putObject: PutObjectRequest = {
    Bucket: bucket,
    Body: blob,
    Key: `${folder}/${fileName}`,
  };
  try {
    await getS3Object().putObject(putObject).promise();
    console.log('S3', 'Saved file:', { fileName });
  } catch (e) {
    console.log('S3', 'Failed to save the file:', { fileName, e });
    throw e;
  }
};

export default { saveJsonFile, getJsonFile, listFiles, uploadBlobFile };
