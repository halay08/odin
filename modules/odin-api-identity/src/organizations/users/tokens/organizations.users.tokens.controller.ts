import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import {
  OrganizationUserTokenCreate,
} from '@d19n/models/dist/identity/organization/user/token/organization.user.token.create';
import {
  OrganizationUserTokenEntity,
} from '@d19n/models/dist/identity/organization/user/token/organization.user.token.entity';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsUsersTokensService } from './organizations.users.tokens.service';

@ApiTags('Auth Tokens')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: "" })
@ApiResponse({ status: 201, type: ApiResponseType, description: "" })
@ApiResponse({ status: 401, type: ExceptionType, description: "Unauthorized" })
@ApiResponse({ status: 404, type: ExceptionType, description: "Not found" })
@ApiResponse({ status: 422, type: ExceptionType, description: "Unprocessable entity validation failed"})
@ApiResponse({ status: 500, type: ExceptionType, description: "Internal server error" })
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/tokens`)
export class OrganizationsUsersTokensController {

    public constructor(private readonly tokensService: OrganizationsUsersTokensService) {

    }

    @Get()
    @HasPermissions('rbac.tokens.search')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    public async search(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<OrganizationUserTokenEntity[]> {
       return await this.tokensService.search(principal.organization);
    }

    @Get('/bytoken/:token')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('rbac.tokens.get')
    public async getByToken(
        @Param('token') token: string
    ): Promise<OrganizationUserTokenEntity> {
      return await this.tokensService.getByToken(token);
    }

    @Get('/:tokenId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('rbac.tokens.get')
    public async getTokenById(
        @Param('tokenId') tokenId: string
    ): Promise<OrganizationUserTokenEntity> {
      return await this.tokensService.getTokenById(tokenId);
    }

    @Post()
    @HasPermissions('rbac.tokens.create')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    public async create(
        @Principal() principal: OrganizationUserEntity,
        @Body() tokenCreate: OrganizationUserTokenCreate
    ): Promise<OrganizationUserTokenEntity> {
        return await this.tokensService.create(principal, tokenCreate);
    }


    @Delete('/:id')
    @HasPermissions('rbac.tokens.delete')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    public async deleteByIdAndOrganizationEntity(
        @Principal() principal: OrganizationUserEntity,
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<{affected: number}> {
        return await this.tokensService.deleteByIdAndOrganizationEntity(id, principal.organization);
    }

}
