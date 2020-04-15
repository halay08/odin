import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GocardlessCustomersBankAccountsService } from './gocardless.customers.bank.accounts.service';
import { GocardlessCustomerBankAccountEntity } from './types/gocardless.customer.bank.account.entity';

@ApiTags('Gocardless Customers Bank Accounts')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/gocardless/bank-accounts`)
export class GocardlessCustomersBankAccountsController {

    private gocardlessCustomersBankAccountsService: GocardlessCustomersBankAccountsService;

    constructor(gocardlessCustomersBankAccountsService: GocardlessCustomersBankAccountsService) {
        this.gocardlessCustomersBankAccountsService = gocardlessCustomersBankAccountsService;
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
    public async listCustomerBankAccounts(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
    ): Promise<ApiResponseType<GocardlessCustomerBankAccountEntity[]>> {

        const res: GocardlessCustomerBankAccountEntity[] = await this.gocardlessCustomersBankAccountsService.listCustomerBankAccounts(
            principal);
        const apiResponse = new ApiResponseType<GocardlessCustomerBankAccountEntity[]>(200, '', res);
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
    public async createCustomerBankAccount(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: GocardlessCustomerBankAccountEntity,
    ): Promise<ApiResponseType<GocardlessCustomerBankAccountEntity>> {

        const res: GocardlessCustomerBankAccountEntity = await this.gocardlessCustomersBankAccountsService.createCustomerBankAccount(
            principal,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerBankAccountEntity>(201, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param bankAccountId
     */
    @Get('/:bankAccountId')
    @UseGuards(PrincipalGuard)
    public async getCustomerBankAccountById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('bankAccountId') bankAccountId: string,
    ): Promise<ApiResponseType<GocardlessCustomerBankAccountEntity>> {

        const res: GocardlessCustomerBankAccountEntity = await this.gocardlessCustomersBankAccountsService.getCustomerBankAccountById(
            principal,
            bankAccountId,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerBankAccountEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param bankAccountId
     * @param body
     */
    @Put('/:bankAccountId')
    @UseGuards(PrincipalGuard)
    public async updateCustomerBankAccountById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('bankAccountId') bankAccountId: string,
        @Body() body: GocardlessCustomerBankAccountEntity,
    ): Promise<ApiResponseType<GocardlessCustomerBankAccountEntity>> {

        const res: GocardlessCustomerBankAccountEntity = await this.gocardlessCustomersBankAccountsService.updateCustomerBankAccountById(
            principal,
            bankAccountId,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessCustomerBankAccountEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param bankAccountId
     */
    @Post('/:bankAccountId/action/disable')
    @UseGuards(PrincipalGuard)
    public async disableCustomerBankAccountById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('bankAccountId') bankAccountId: string,
    ): Promise<ApiResponseType<any>> {

        const res: any = await this.gocardlessCustomersBankAccountsService.disableCustomerBankAccountById(
            principal,
            bankAccountId,
        );
        const apiResponse = new ApiResponseType<any>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


}
