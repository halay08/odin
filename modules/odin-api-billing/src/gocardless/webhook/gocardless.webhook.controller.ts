import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { GocardlessWebhookService } from "./gocardless.webhook.service";

@ApiTags('Gocardless Webhook')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: "" })
@ApiResponse({ status: 201, type: ApiResponseType, description: "" })
@ApiResponse({ status: 401, type: ExceptionType, description: "Unauthorized" })
@ApiResponse({ status: 404, type: ExceptionType, description: "Not found" })
@ApiResponse({ status: 422, type: ExceptionType, description: "Unprocessable entity validation failed" })
@ApiResponse({ status: 500, type: ExceptionType, description: "Internal server error" })
@Controller(`/${SERVICE_NAME.BILLING_MODULE}/v1.0/gocardless`)
export class GocardlessWebhookController {

    private gocardlessWebhookService: GocardlessWebhookService;

    constructor(gocardlessWebhookService: GocardlessWebhookService) {
        this.gocardlessWebhookService = gocardlessWebhookService;
    }

    /**
     *
     * @param request
     * @param response
     * @param headers
     * @param body
     */
    @Post('/webhook')
    public async webhook(
        @Req() request,
        @Res() response,
        @Headers() headers,
        @Body() body: any,
    ): Promise<ApiResponseType<any>> {
        const res: any = await this.gocardlessWebhookService.webhook(headers, body);
        const apiResponse = new ApiResponseType<any>(201, "success", res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }


}
