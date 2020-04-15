import { ApiTags, ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { Body, Controller, Post, Req, Res,Headers, UseGuards, Get } from "@nestjs/common";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { Principal } from "@d19n/common/dist/decorators/Principal";
import { PrincipalGuard } from "@d19n/client/dist/guards/PrincipalGuard";
import { TemplatesEmailService } from "./templates.email.service";
import { TemplatesEmailCreateDto } from "./templates.email.create.dto";
import { TemplatesEmailEntity } from "./templates.email.entity";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";

@ApiTags('Email Templates')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: "" })
@ApiResponse({ status: 201, type: ApiResponseType, description: "" })
@ApiResponse({ status: 401, type: ExceptionType, description: "Unauthorized" })
@ApiResponse({ status: 404, type: ExceptionType, description: "Not found" })
@ApiResponse({ status: 422, type: ExceptionType, description: "Unprocessable entity validation failed"})
@ApiResponse({ status: 500, type: ExceptionType, description: "Internal server error" })
@Controller(`/${SERVICE_NAME.NOTIFICATION_MODULE}/v1.0/templates/emails`)
export class TemplatesEmailController {

    private templatesEmailService: TemplatesEmailService;

    constructor(templatesEmailService: TemplatesEmailService) {
        this.templatesEmailService = templatesEmailService;
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
    public async listTemplatesByOrganization(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Headers() headers,
    ): Promise<ApiResponseType<TemplatesEmailEntity[]>> {
        const res: any = await this.templatesEmailService.listTemplatesByOrganization(principal.organization, headers);
        const apiResponse = new ApiResponseType<TemplatesEmailEntity[]>(200, "success", res);
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
    public async createTemplateByPrincipal(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Headers() headers,
        @Body() body: TemplatesEmailCreateDto,
    ): Promise<ApiResponseType<TemplatesEmailEntity>> {
        const res: any = await this.templatesEmailService.createTemplateByPrincipal(principal, body, headers);
        const apiResponse = new ApiResponseType<TemplatesEmailEntity>(201, "success", res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }


}
