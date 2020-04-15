import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GocardlessCustomersService } from './gocardless.customers.service';
import { GocardlessCustomerEntity } from './types/gocardless.customer.entity';

@ApiTags('Gocardless Customers')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/gocardless/customers`)
export class GocardlessCustomersController {

    private customersService: GocardlessCustomersService;

    constructor(customersService: GocardlessCustomersService) {
        this.customersService = customersService;
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
    public async listCustomers(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
    ): Promise<ApiResponseType<GocardlessCustomerEntity[]>> {

        const res: GocardlessCustomerEntity[] = await this.customersService.listCustomers(principal);
        const apiResponse = new ApiResponseType<GocardlessCustomerEntity[]>(200, '', res);
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
    public async createCustomer(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: GocardlessCustomerEntity,
    ): Promise<ApiResponseType<GocardlessCustomerEntity[]>> {

        const res: GocardlessCustomerEntity = await this.customersService.createCustomer(principal, body);
        const apiResponse = new ApiResponseType<GocardlessCustomerEntity>(201, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param customerId
     */
    @Get('/:customerId')
    @UseGuards(PrincipalGuard)
    public async getCustomerById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('customerId') customerId: string,
    ): Promise<ApiResponseType<GocardlessCustomerEntity>> {

        const res: GocardlessCustomerEntity = await this.customersService.getCustomerById(principal, customerId);
        const apiResponse = new ApiResponseType<GocardlessCustomerEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param customerId
     * @param body
     */
    @Put('/:customerId')
    @UseGuards(PrincipalGuard)
    public async updateCustomerById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('customerId') customerId: string,
        @Body() body: GocardlessCustomerEntity,
    ): Promise<ApiResponseType<GocardlessCustomerEntity>> {

        const res: GocardlessCustomerEntity = await this.customersService.updateCustomerById(
            principal,
            customerId,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param customerId
     */
    @Delete('/:customerId')
    @UseGuards(PrincipalGuard)
    public async deleteCustomerById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('customerId') customerId: string,
    ): Promise<ApiResponseType<any>> {

        const res: GocardlessCustomerEntity = await this.customersService.deleteCustomerById(principal, customerId);
        const apiResponse = new ApiResponseType<GocardlessCustomerEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


}
