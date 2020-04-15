import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GisFtthFeaturesService } from './gis.ftth.features.service';


@ApiTags('Gis Features')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/cst/Feature`)
export class GisFtthFeaturesController {

    public constructor(private readonly gisFtthFeaturesService: GisFtthFeaturesService) {
        this.gisFtthFeaturesService = gisFtthFeaturesService;
    }

    /**
     * Update or Creates a Feature in Odin from a feature in GIS
     * Using the featureType and featureId
     *
     * @param principal
     * @param featureType
     * @param featureId
     */
    @Get(':featureType/:featureId')
    @UseGuards(PrincipalGuard)
    public async importFeatureFromGis(
        @Principal() principal: OrganizationUserEntity,
        @Param('featureType') featureType: string,
        @Param('featureId') featureId: number,
    ): Promise<IDbRecordCreateUpdateRes> {

        return await this.gisFtthFeaturesService.importFeatureFromGis(principal, featureType, featureId);

    }

    /**
     * Selects or Creates a Feature object by GIS id
     * @param principal
     * @param featureType
     * @param featureId
     */
    @Delete(':featureType/:featureId')
    @UseGuards(PrincipalGuard)
    public async updateOdinFeatureFromGis(
        @Principal() principal: OrganizationUserEntity,
        @Param('featureType') featureType: string,
        @Param('featureId') featureId: number,
    ): Promise<IDbRecordCreateUpdateRes> {

        return await this.gisFtthFeaturesService.deleteOdinFeatureFromGis(principal, featureType, featureId);

    }

}
