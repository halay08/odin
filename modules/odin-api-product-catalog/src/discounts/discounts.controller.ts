import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';


@ApiTags('Discounts')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/discounts`)
export class DiscountsController {

    public constructor(private readonly discountsService: DiscountsService) {
        this.discountsService = discountsService;
    }

    /**
     *
     * @param principal
     * @param query
     */
    @Get('byCode/:code')
    @UseGuards(PrincipalGuard)
    public async redeemDiscount(
        @Principal() principal: OrganizationUserEntity,
        @Param('code') code: string,
    ): Promise<DbRecordEntityTransform> {
        return await this.discountsService.redeemDiscount(
            principal,
            code,
        );
    }

}
