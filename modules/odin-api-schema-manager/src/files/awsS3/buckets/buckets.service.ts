// Load the SDK for JavaScript
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { S3BucketCreateDto } from './types/bucket.create.dto';
import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk/global';
// import S3 from 'aws-sdk/clients/s3';
const S3 = require('aws-sdk/clients/s3');

@Injectable()
export class BucketsService {

  /**
   *
   * @param principal
   * @param body
   */
  public createBucket(principal: OrganizationUserEntity, body: S3BucketCreateDto): Promise<string> {

    return new Promise((resolve, reject) => {

      // Set the region dynamically based on the organizations AWS_REGION
      AWS.config.update({ region: 'eu-west-2' });
      // Create S3 service object
      const s3 = new S3({ apiVersion: '2006-03-01' });

      // Create the parameters for calling createBucket
      const bucketParams = {
        Bucket: `odin-org-files-${principal.organization.id}`,
      };

      // call S3 to create the bucket
      s3.createBucket(bucketParams, function (err, data) {
        if(err) {
          console.log('Error', err);
          return reject(err);
        } else {
          console.log('Success', data);
          return resolve(data);
        }
      });
    });

  }

  /**
   *
   * @param principal
   * @param bucketName
   */
  public listBucketObjects(principal: OrganizationUserEntity, bucketName: string, pathName: string): Promise<any> {

    return new Promise((resolve, reject) => {

      // Set the region dynamically based on the organizations AWS_REGION
      AWS.config.update({ region: 'eu-west-2' });
      // Create S3 service object
      const s3 = new S3({ apiVersion: '2006-03-01' });

      // Create the parameters for calling listObjects
      const bucketParams = {
        Bucket: bucketName,
        Prefix: pathName,
      };

      // Call S3 to obtain a list of the objects in the bucket
      s3.listObjects(bucketParams, function (err, data) {
        if(err) {
          console.log('Error', err);
          return reject(err);
        } else {
          console.log('Success', data);
          return resolve(data);
        }
      });
    });
  }

  /**
   *
   * @param principal
   * @param bucketName
   * @param pathName
   * @param body
   */
  public putObjectToS3(principal: OrganizationUserEntity, bucketName: string, pathName: string, body: any): Promise<any> {

    return new Promise((resolve, reject) => {
      // Set the region dynamically based on the organizations AWS_REGION
      AWS.config.update({ region: 'eu-west-2' });
      // Create S3 service object
      const s3 = new S3({ apiVersion: '2006-03-01' });

      // Create the parameters for calling listObjects
      const bucketParams = {
        Bucket: bucketName,
        Key: pathName,
        Body: body,
      };

      // Call S3 to obtain a list of the objects in the bucket
      s3.putObject(bucketParams, function (err, data) {
        if(err) {
          console.log('Error', err);
          return reject(err);
        } else {
          console.log('Success', data);
          return resolve(data);
        }
      });
    });
  }


  /**
   *
   * @param principal
   * @param bucketName
   * @param pathName
   * @param action
   */
  public async getPresignedUrl(principal: OrganizationUserEntity, bucketName: string, pathName: string, action: string ='getObject', expires: number=86400):Promise<any>{
    const s3 = new S3({ signatureVersion: "v4" });
    const params = {Bucket: bucketName,
      Key: pathName,
      Expires: expires // In seconds
    };
    return await s3.getSignedUrl(action, params);
  }


}
