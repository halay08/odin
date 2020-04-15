import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GisFtthClosuresService } from './gis.ftth.closures.service';
import { FtthClosureConnection } from './interfaces/ftth.closure-connection.interface';


@ApiTags('FTTH Closure Connections')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/ftth/closures`)
export class GisFtthClosuresController {

    private gisFtthConnectionsService: GisFtthClosuresService;

    constructor(
        gisFtthConnectionsService: GisFtthClosuresService,
    ) {
        this.gisFtthConnectionsService = gisFtthConnectionsService;
    }

    /**
     * Gets all connections related to a given closure id.
     * The result should be used topopulate the grid of connections of the given closure.
     *
     * @param principal
     * @param closureId
     */
    @Get('connections/:closureId')
    @UseGuards(PrincipalGuard)
    async getConnectionsBy(
        @Principal() principal: OrganizationUserEntity,
        @Param('closureId') closureId: number,
    ): Promise<FtthClosureConnection> {

        return await this.gisFtthConnectionsService.getConnectionsByClosureId(principal, closureId);

    }

    /**
     * Returns all cables intersecting a single closure by id
     *
     * @param principal
     * @param closureId
     */
    @Get('cables/:closureId')
    @UseGuards(PrincipalGuard)
    async getAllCablesIntersectingClosure(
        @Principal() principal: OrganizationUserEntity,
        @Param('closureId') closureId: number,
    ): Promise<DbRecordEntityTransform[]> {

        return await this.gisFtthConnectionsService.getAllCablesIntersectingClosure(principal, closureId);

    }

}
