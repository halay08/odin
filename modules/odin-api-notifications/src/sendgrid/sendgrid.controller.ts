import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { Body, Controller, Get, Headers, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendgridService } from './sendgrid.service';

@ApiTags('Sendgrid Email')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${SERVICE_NAME.NOTIFICATION_MODULE}/v1.0/sendgrid`)
export class SendgridController {

    private sendgridService: SendgridService;

    constructor(sendgridService: SendgridService) {
        this.sendgridService = sendgridService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param body
     */
    @Post('/dynamic_template')
    @UseGuards(PrincipalGuard)
    public async sendDynamicTemplateEmail(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: SendgridEmailEntity,
    ): Promise<ApiResponseType<any>> {
        const res: any = await this.sendgridService.sendDynamicTemplateEmail(principal, body);
        const apiResponse = new ApiResponseType<any>(201, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

    /**
     *
     * @param request
     * @param response
     * @param headers
     * @param body
     */
    @Post('/webhook')
    public async sendgridWebhook(
        @Req() request,
        @Res() response,
        @Headers() headers,
        @Body() body: any,
    ): Promise<ApiResponseType<any>> {
        const res: any = await this.sendgridService.sendgridWebhook(headers, body);
        const apiResponse = new ApiResponseType<any>(201, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

    @Get('/mail-activity/:recordId')
    @UseGuards(PrincipalGuard)
    public async getSendGridMailActivityByRecordId(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('recordId') recordId: string,
    ): Promise<ApiResponseType<any>> {
        const res: any = await this.sendgridService.getSendGridMailActivityByRecordId(principal, recordId);
        const apiResponse = new ApiResponseType<any>(201, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

}
