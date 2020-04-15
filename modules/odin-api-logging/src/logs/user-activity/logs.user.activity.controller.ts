import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { SearchDecoratorsPageable } from "@d19n/models/dist/search/decorators/search.decorators.pageable";
import { SearchDecoratorsSearchable } from "@d19n/models/dist/search/decorators/search.decorators.searchable";
import { SearchResponseType } from "@d19n/models/dist/search/search.response.type";
import { Principal } from "@d19n/common/dist/decorators/Principal";
import { PrincipalGuard } from "@d19n/client/dist/guards/PrincipalGuard";
import { LogsUserActivityService } from "./logs.user.activity.service";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { SearchQueryTypeHttp } from "@d19n/models/dist/search/search.query.type.http";

@ApiTags('User Activity Logs')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired JWT token.' })
@Controller(`${SERVICE_NAME.AUDIT_MODULE}/v1.0/UserActivity`)
export class LogsUserActivityController {

    public constructor(public appLogsService: LogsUserActivityService) {
        this.appLogsService = appLogsService;
    }

    @ApiQuery({ name: "terms", example: "*", required: true })
    @ApiQuery({ name: "page", example: '0', required: true })
    @ApiQuery({ name: "size", example: 5, required: true })
    @ApiQuery({ name: "schemas", required: false })
    @ApiQuery({ name: "range", required: false })
    @ApiQuery({ name: "fields", example: '*', required: false })
    @ApiQuery({ name: "recordId", example: '', required: false })
    @Get('/search')
    @UseGuards(PrincipalGuard)
    public async searchByOrganizationEntity(
        @Principal() principal,
        @Req() request,
        @Res() response,
        @SearchDecoratorsPageable() pageable,
        @SearchDecoratorsSearchable() query: SearchQueryTypeHttp,
    ): Promise<SearchResponseType<any>> {
        const res: SearchResponseType<any> = await this.appLogsService.searchByPrincipal(principal, query);
        return response.status(res.statusCode || 200).json(res);
    }

    // @Post()
    // @UseGuards(PrincipalGuard)
    // public async createByPrincipal(
    //     @Principal() principal,
    //     @Req() request,
    //     @Res() response,
    //     @Body() body: LogsUserActivityCreateDto,
    // ): Promise<LogsUserActivityEntity> {
    //     const res: LogsUserActivityEntity = await this.appLogsService.createByPrincipal(principal, request, body);
    //     return response.status(200).json(res);
    // }

}

