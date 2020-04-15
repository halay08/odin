import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VisitsService } from './visits.service';


@ApiTags('Visits')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/visits`)
export class VisitsController {


    private visitsService: VisitsService;

    constructor(visitsService: VisitsService) {
        this.visitsService = visitsService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    @Post('/visit')
    @ApiBody({ isArray: false, type: DbRecordCreateUpdateDto })
    @UseGuards(PrincipalGuard)
    public async createNewVisit(
        @Principal() principal: OrganizationUserEntity,
        @Headers() headers,
        @Body() body: DbRecordCreateUpdateDto,
    ): Promise<IDbRecordCreateUpdateRes[]> {
        return await this.visitsService.createNewVisit(principal, body);
    }

}
