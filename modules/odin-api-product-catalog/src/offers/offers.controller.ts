import {PrincipalGuard} from '@d19n/client/dist/guards/PrincipalGuard';
import {Principal} from '@d19n/common/dist/decorators/Principal';
import {ExceptionType} from '@d19n/common/dist/exceptions/types/ExceptionType';
import {ApiResponseType} from '@d19n/common/dist/http/types/ApiResponseType';
import {OrganizationUserEntity} from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import {DbRecordEntityTransform} from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import {Controller, Get, Param, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {OffersService} from './offers.service';


@ApiTags('Offer')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({status: 200, type: ApiResponseType, description: ''})
@ApiResponse({status: 201, type: ApiResponseType, description: ''})
@ApiResponse({status: 401, type: ExceptionType, description: 'Unauthorized'})
@ApiResponse({status: 404, type: ExceptionType, description: 'Not found'})
@ApiResponse({status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed'})
@ApiResponse({status: 500, type: ExceptionType, description: 'Internal server error'})
@Controller(`${process.env.MODULE_NAME}/v1.0/cst/Offer`)
export class OffersController {

    public constructor(private readonly offersService: OffersService) {
        this.offersService = offersService;
    }

    /**
     *
     * @param principal
     * @param customerType
     * @param query
     */
    @Get('active/:customerType')
    @ApiQuery({
        name: 'code',
        example: 'TEST123',
        description: 'this will get an offer by code',
        required: false,
    })
    @UseGuards(PrincipalGuard)
    public async getActiveOffer(
        @Principal() principal: OrganizationUserEntity,
        @Param('customerType') customerType:string,
        @Query() query: any,
    ): Promise<DbRecordEntityTransform> {

        return await this.offersService.getActiveOffer(principal, customerType, query['code']);

    }

}
