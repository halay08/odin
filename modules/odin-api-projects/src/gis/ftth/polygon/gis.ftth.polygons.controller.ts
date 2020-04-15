import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFtthPolygonDto } from './dto/create-ftth-polygon.dto';
import { UpdateFtthPolygonDto } from './dto/update-ftth-polygon.dto';
import { GisFtthPolygonsService } from './gis.ftth.polygons.service';
import { FtthPolygonDeleteRes } from './interfaces/ftth-polygon-delete-res.interface';
import { FtthPolygon } from './interfaces/ftth-polygon.interface';


@ApiTags('FTTH Polygons')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/ftth/polygon`)
export class GisFtthPolygonsController {

    private gisFtthPolygonsService: GisFtthPolygonsService;

    constructor(
        gisFtthPolygonsService: GisFtthPolygonsService,
    ) {

        this.gisFtthPolygonsService = gisFtthPolygonsService;

    }

    /**
     *
     * @param principal
     * @param body
     */
    @Post()
    @UseGuards(PrincipalGuard)
    async create(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: CreateFtthPolygonDto,
    ): Promise<FtthPolygon> {

        return await this.gisFtthPolygonsService.create(principal, body);

    }

    /**
     *
     * @param principal
     * @param polygonId
     * @param body
     */
    @Put(':polygonId')
    @UseGuards(PrincipalGuard)
    async updatePolygonById(
        @Principal() principal: OrganizationUserEntity,
        @Param('polygonId') polygonId: number,
        @Body() body: UpdateFtthPolygonDto,
    ): Promise<FtthPolygon> {

        return await this.gisFtthPolygonsService.updateById(principal, polygonId, body);

    }

    /**
     *
     * @param principal
     * @param polygonId
     */
    @Delete(':polygonId')
    @UseGuards(PrincipalGuard)
    async deleteById(
        @Principal() principal: OrganizationUserEntity,
        @Param('polygonId') polygonId: number,
    ): Promise<FtthPolygonDeleteRes> {

        return await this.gisFtthPolygonsService.deleteById(principal, polygonId);

    }

}
