import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TasksTemplatesService } from './tasks.templates.service';


@ApiTags('Tasks')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/tasks/templates`)
export class TasksTemplatesController {

    public constructor(private readonly tasksTemplatesService: TasksTemplatesService) {
        this.tasksTemplatesService = tasksTemplatesService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param templateKey
     * @param body
     */
    @Post('/:milestoneId/:templateKey')
    @UseGuards(PrincipalGuard)
    public async createTasksFromTemplate(
        @Principal() principal: OrganizationUserEntity,
        @Param('templateKey') templateKey: string,
        @Param('milestoneId') milestoneId: string,
        @Body() body: { [key: string]: any },
    ): Promise<any> {
        return await this.tasksTemplatesService.createTasksFromTemplate(principal, milestoneId, templateKey, body);
    }

}
