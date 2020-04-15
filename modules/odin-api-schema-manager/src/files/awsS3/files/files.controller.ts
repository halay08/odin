import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { Controller, Delete, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { DbRecordDeleted } from '../../../db/types/db.record.deleted';
import { FilesService } from './files.service';


@ApiTags('S3 Files')
@ApiBearerAuth()
@ApiConsumes('multipart/form-data')
@ApiProduces('multipart/form-data')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/SchemaModule/v1.0/s3/files`)
export class FilesController {
  constructor(private readonly fileUploadService: FilesService) {
    this.fileUploadService = fileUploadService;
  }


  /**
   *
   * @param principal
   * @param recordId
   * @param key
   * @param file
   */
  @Post(':recordId/upload')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemamodule.file.create')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFileWithRecordAssociation(
    @Principal() principal: OrganizationUserEntity,
    @Param('recordId') recordId: string,
    @Param('key') key: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IDbRecordCreateUpdateRes> {
    return await this.fileUploadService.uploadFileWithRecordAssociation(principal, recordId, file);
  }

  /**
   *
   * @param principal
   * @param moduleName
   * @param entityName
   * @param file
   */
  @Post(':moduleName/:entityName/upload')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemamodule.file.create')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFileModuleAndEntity(
    @Principal() principal: OrganizationUserEntity,
    @Param('moduleName') moduleName: string,
    @Param('entityName') entityName: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IDbRecordCreateUpdateRes> {
    return await this.fileUploadService.uploadFileForModuleAndEntity(principal, moduleName, entityName, file);
  }


  /**
   *
   * @param principal
   * @param recordId
   * @param file
   */
  @Delete(':recordId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemamodule.file.delete')
  public async deleteFile(
    @Principal() principal: OrganizationUserEntity,
    @Param('recordId') recordId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DbRecordDeleted[]> {
    return await this.fileUploadService.deleteFile(principal, recordId);
  }

}
