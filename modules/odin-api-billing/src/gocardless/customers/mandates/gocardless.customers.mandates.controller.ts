import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GocardlessCustomersMandatesService } from './gocardless.customers.mandates.service';
import { GocardlessCustomerMandateEntity } from './types/gocardless.customer.mandate.entity';

@ApiTags('Gocardless Customers Mandates')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/gocardless/mandates`)
export class GocardlessCustomersMandatesController {

    private gocardlessCustomersMandatesService: GocardlessCustomersMandatesService;

    constructor(gocardlessCustomersMandatesService: GocardlessCustomersMandatesService) {
        this.gocardlessCustomersMandatesService = gocardlessCustomersMandatesService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     */
    @Get()
    @UseGuards(PrincipalGuard)
    public async listCustomerMandates(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
    ): Promise<ApiResponseType<GocardlessCustomerMandateEntity[]>> {

        const res: GocardlessCustomerMandateEntity[] = await this.gocardlessCustomersMandatesService.listCustomerMandates(
            principal,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerMandateEntity[]>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param body
     */
    @Post()
    @UseGuards(PrincipalGuard)
    public async createCustomerMandate(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: GocardlessCustomerMandateEntity,
    ): Promise<ApiResponseType<GocardlessCustomerMandateEntity>> {

        const res: GocardlessCustomerMandateEntity = await this.gocardlessCustomersMandatesService.createCustomerMandate(
            principal,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerMandateEntity>(201, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    @Get('/:mandateId')
    @UseGuards(PrincipalGuard)
    public async getCustomerMandateById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('mandateId') mandateId: string,
    ): Promise<ApiResponseType<GocardlessCustomerMandateEntity>> {

        const res: GocardlessCustomerMandateEntity = await this.gocardlessCustomersMandatesService.getCustomerMandateById(
            principal,
            mandateId,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerMandateEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param mandateId
     * @param body
     */
    @Put('/:mandateId')
    @UseGuards(PrincipalGuard)
    public async updateCustomerMandateById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('mandateId') mandateId: string,
        @Body() body: GocardlessCustomerMandateEntity,
    ): Promise<ApiResponseType<GocardlessCustomerMandateEntity>> {

        const res: GocardlessCustomerMandateEntity = await this.gocardlessCustomersMandatesService.updateCustomerMandateById(
            principal,
            mandateId,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerMandateEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param mandateId
     */
    @Post('/:mandateId/actions/cancel')
    @UseGuards(PrincipalGuard)
    public async cancelCustomerMandateById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('mandateId') mandateId: string,
    ): Promise<ApiResponseType<any>> {

        const res: any = await this.gocardlessCustomersMandatesService.cancelCustomerMandateById(
            principal,
            mandateId,
        );
        const apiResponse = new ApiResponseType<any>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param mandateId
     */
    @Post('/:mandateId/actions/reinstate')
    @UseGuards(PrincipalGuard)
    public async reinstateCustomerMandateById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('mandateId') mandateId: string,
    ): Promise<ApiResponseType<any>> {

        const res: any = await this.gocardlessCustomersMandatesService.reinstateCustomerMandateById(
            principal,
            mandateId,
        );
        const apiResponse = new ApiResponseType<any>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


}
