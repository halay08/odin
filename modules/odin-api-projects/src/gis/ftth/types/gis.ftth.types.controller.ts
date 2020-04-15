import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FtthTypeDto } from './dto/ftth-type.dto';
import { GisFtthTypesService } from './gis.ftth.types.service';
import { FtthTypeDeleteRes } from './interfaces/ftth.cable.delete.res.interface';
import { FtthType } from './interfaces/ftth.type.interface';


@ApiTags('FTTH Types')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/ftth/type`)
export class GisFtthTypesController {

    private gisFtthTypesService: GisFtthTypesService;

    constructor(
        gisFtthTypesService: GisFtthTypesService,
    ) {

        this.gisFtthTypesService = gisFtthTypesService;

    }

    /**
     *
     * @param principal
     * @param featureName
     * @param body
     */
    @Get(':featureName')
    @UseGuards(PrincipalGuard)
    async getByFeatureName(
        @Principal() principal: OrganizationUserEntity,
        @Param('featureName') featureName: string,
        @Body() body: FtthTypeDto,
    ): Promise<FtthType> {

        return await this.gisFtthTypesService.create(principal, featureName, body);

    }

    /**
     *
     * @param principal
     * @param featureName
     * @param body
     */
    @Post(':featureName')
    @UseGuards(PrincipalGuard)
    async create(
        @Principal() principal: OrganizationUserEntity,
        @Param('featureName') featureName: string,
        @Body() body: FtthTypeDto,
    ): Promise<FtthType> {

        return await this.gisFtthTypesService.create(principal, featureName, body);

    }

    /**
     *
     * @param principal
     * @param typeId
     * @param featureName
     * @param body
     */
    @Put(':featureName')
    @UseGuards(PrincipalGuard)
    async updateTypeById(
        @Principal() principal: OrganizationUserEntity,
        @Param('featureName') featureName: string,
        @Body() body: FtthTypeDto,
    ): Promise<FtthType> {

        return await this.gisFtthTypesService.updateById(principal, featureName, body);

    }


    /**
     *
     * @param principal
     * @param typeId
     * @param featureName
     */
    @Delete(':featureName')
    @UseGuards(PrincipalGuard)
    async deleteById(
        @Principal() principal: OrganizationUserEntity,
        @Param('featureName') featureName: string,
        @Body() body: FtthTypeDto,
    ): Promise<FtthTypeDeleteRes> {

        return await this.gisFtthTypesService.deleteById(principal, featureName, body);

    }

}
