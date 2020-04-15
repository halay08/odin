import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
// import individual service
import S3 from 'aws-sdk/clients/s3';
// import AWS object without services
import AWS from 'aws-sdk/global';
import { S3_BUCKET_NAME_FOR_ORG_FILES } from '../../../common/Constants';
import { DbService } from '../../../db/db.service';
import { DbRecordDeleted } from '../../../db/types/db.record.deleted';
import { SchemasService } from '../../../schemas/schemas.service';


export class S3FileUploadSingleDto {
  public bucketName: string;
  public key: string;
  public file: any
}

@Injectable()
export class FilesService {

  private readonly s3: S3;

  constructor(
    @Inject(forwardRef(() => DbService)) private readonly dbService: DbService,
    @Inject(forwardRef(() => SchemasService)) private schemasService: SchemasService,
  ) {

    this.dbService = dbService;
    this.schemasService = schemasService;

    // Set the region
    AWS.config.update({
      region: 'eu-west-2',
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    });

    // Create S3 service object
    this.s3 = new S3({ apiVersion: '2006-03-01' });

  }

  /**
   *
   * @param principal
   * @param bucketName
   * @param key
   * @param file
   */
  public uploadFileWithRecordAssociation(
    principal: OrganizationUserEntity,
    recordId: string,
    file: any,
  ): Promise<IDbRecordCreateUpdateRes> {

    return new Promise(async (resolve, reject) => {
      try {

        const dbRecord = await this.dbService.getDbRecordsByOrganizationAndId(principal.organization, recordId);
        const schema = await this.schemasService.getSchemaByOrganizationAndId(
          principal.organization,
          { schemaId: dbRecord.schemaId },
        );

        const bucketName = S3_BUCKET_NAME_FOR_ORG_FILES;
        const uploadParams = { ACL: 'public-read', Bucket: bucketName, Key: '', Body: '' };

        // Configure the file stream and obtain the upload parameters
        uploadParams.Body = file.buffer;
        uploadParams.Key = `${schema.moduleName}/${schema.entityName}/${dbRecord.id}/${file.originalname}`;

        // call S3 to retrieve upload file to specified bucket
        this.s3.upload(uploadParams, async (err, data) => {
          if(err) {
            console.log('Error', err);
            return reject(err);
          }
          if(data) {

            const newFile = new DbRecordCreateUpdateDto();
            newFile.entity = 'SchemaModule:File';
            newFile.title = file.originalname;
            newFile.properties = {
              DataStore: 'AWS_S3',
              Bucket: `${data.Bucket}`,
              Key: `${data.Key}`,
              Url: data.Location,
              Mimetype: file.mimetype,
            };
            newFile.associations = [
              {
                recordId: dbRecord.id,
              },
            ];

            const res = await this.dbService.updateOrCreateDbRecordsByPrincipal(
              principal,
              [ newFile ],
              { upsert: true },
            );

            return resolve(res[0]);
          }
        });
      } catch (e) {
        console.error(e);
        throw new ExceptionType(e.statusCode, e.message, e.validation);
      }
    });
  }


  /**
   *
   * @param principal
   * @param bucketName
   * @param key
   * @param file
   */
  public uploadFileForModuleAndEntity(
    principal: OrganizationUserEntity,
    moduleName: string,
    entityName: string,
    file: any,
  ): Promise<IDbRecordCreateUpdateRes> {

    return new Promise(async (resolve, reject) => {
      try {
        // call S3 to retrieve upload file to specified bucket

        const bucketName = S3_BUCKET_NAME_FOR_ORG_FILES;
        const uploadParams = { ACL: 'public-read', Bucket: bucketName, Key: '', Body: '' };

        // Configure the file stream and obtain the upload parameters
        uploadParams.Body = file.buffer;
        uploadParams.Key = `${moduleName}/${entityName}/${file.originalname}`;

        // call S3 to retrieve upload file to specified bucket
        this.s3.upload(uploadParams, async (err, data) => {
          if(err) {
            return reject(err);
          }
          if(data) {

            const newFile = new DbRecordCreateUpdateDto();
            newFile.entity = 'SchemaModule:File';
            newFile.title = file.originalname;
            newFile.properties = {
              DataStore: 'AWS_S3',
              Bucket: `${data.Bucket}`,
              Key: `${data.Key}`,
              Url: data.Location,
              Mimetype: file.mimetype,
            };
            const res = await this.dbService.updateOrCreateDbRecordsByPrincipal(
              principal,
              [ newFile ],
              { upsert: true },
            );

            return resolve(res[0]);
          }
        });
      } catch (e) {
        console.error(e);
        throw new ExceptionType(e.statusCode, e.message, e.validation);
      }
    });
  }

  /**
   *
   * @param principal
   * @param bucketName
   * @param key
   * @param file
   */
  public deleteFile(principal: OrganizationUserEntity, recordId: string): Promise<DbRecordDeleted[]> {

    return new Promise(async (resolve, reject) => {

      const dbRecord = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        recordId,
        [],
      );

      // call S3 to retrieve upload file to specified bucket

      const uploadParams = { Bucket: getProperty(dbRecord, 'Bucket'), Key: getProperty(dbRecord, 'Key') };

      // call S3 to retrieve upload file to specified bucket
      this.s3.deleteObject(uploadParams, async (err, data) => {
        if(err) {
          console.log('Error', err);
          return reject(err);
        }
        if(data) {
          const res = await this.dbService.deleteByPrincipalAndId(principal, recordId);

          return resolve(res);
        }
      });
    });
  }

}
