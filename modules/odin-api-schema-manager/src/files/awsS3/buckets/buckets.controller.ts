import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BucketsService } from './buckets.service';
import { S3BucketCreateDto } from './types/bucket.create.dto';


@ApiTags('S3 Buckets')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/SchemaModule/v1.0/s3/buckets`)
export class BucketsController {
  constructor(private readonly bucketsService: BucketsService) {
    this.bucketsService = bucketsService;
  }

  /**
   *
   * @param principal
   * @param bucketName
   * @param pathName
   */
  @Get(':bucketName')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.search')
  public async listObjectsInBucket(
    @Principal() principal: OrganizationUserEntity,
    @Param('bucketName') bucketName: string,
    @Query('pathName') pathName: string,
  ): Promise<any> {
    const res = await this.bucketsService.listBucketObjects(principal, bucketName, pathName);
    console.log(res);

    return res;
  }

  /**
   *
   * @param principal
   * @param body
   */
  @Post()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.create')
  public async uploadFile(
    @Principal() principal: OrganizationUserEntity,
    @Body() body: S3BucketCreateDto,
  ) {
    return await this.bucketsService.createBucket(principal, body);
  }

}
