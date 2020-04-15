import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GocardlessBankLookupService } from './gocardless.bank.lookup.service';
import { GocardlessBankLookupEntity } from './types/gocardless.bank.lookup.entity';

@ApiTags('Gocardless Bank Lookup')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/gocardless/bank-lookup`)
export class GocardlessBankLookupController {

    private gocardlessBankLookupService: GocardlessBankLookupService;

    constructor(gocardlessBankLookupService: GocardlessBankLookupService) {
        this.gocardlessBankLookupService = gocardlessBankLookupService;
    }


    @Post()
    @UseGuards(PrincipalGuard)
    public async lookUpBankDetails(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: GocardlessBankLookupEntity,
    ): Promise<ApiResponseType<GocardlessBankLookupEntity>> {

        const res: GocardlessBankLookupEntity = await this.gocardlessBankLookupService.lookUpBankDetails(
            principal,
            body,
        );
        const apiResponse = new ApiResponseType<any>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


}
