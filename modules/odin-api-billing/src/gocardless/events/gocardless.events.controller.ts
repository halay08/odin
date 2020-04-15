import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags, ApiQuery } from "@nestjs/swagger";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { Controller, Headers, Get, Req, Res, Query } from "@nestjs/common";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { EventsService } from "./gocardless.events.service";

@ApiTags('Gocardless Events')
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

export class GocardlessEventsController {

    private eventsService: EventsService;
    constructor(eventsService: EventsService) {
        this.eventsService = eventsService;
    }

    @Get('/events/search')
    public async getEvents(
        @Req() request,
        @Res() response,
        @Headers() headers,
        @Query() query,
    ): Promise<ApiResponseType<any>> {
        const res: any = await this.eventsService.getEvents(headers, query);
        const apiResponse = new ApiResponseType<any>(201, "success", res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }
}
