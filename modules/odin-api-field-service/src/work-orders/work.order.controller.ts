import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServiceAppointmentCreateDto } from '../service-appointment/types/service.appointment.create.dto';
import { WorkOrderWithAppointmentCreateDto } from './types/work.order.with.appointment.create.dto';
import { WorkOrderService } from './work.order.service';


@ApiTags('Work Order')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/${SchemaModuleEntityTypeEnums.WORK_ORDER}`)
export class WorkOrderController {

    public constructor(private readonly workOrderService: WorkOrderService) {
        this.workOrderService = workOrderService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param body
     */
    @Post('/order/:orderId')
    @ApiBody({ isArray: false, type: WorkOrderWithAppointmentCreateDto })
    @UseGuards(PrincipalGuard)
    public async createWorkOrderFromOrder(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() body: WorkOrderWithAppointmentCreateDto,
    ): Promise<any> {
        return await this.workOrderService.createWorkOrderFromOrder(principal, orderId, body);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param body
     */
    @Post('/:orderItemId/provision')
    @ApiBody({ isArray: false, type: ServiceAppointmentCreateDto })
    @UseGuards(PrincipalGuard)
    public async provisionWorkOrderItemRequest(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderItemId', ParseUUIDPipe) orderItemId: string,
    ): Promise<any> {
        return await this.workOrderService.provisionWorkOrderItemRequest(principal, orderItemId);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param workOrderId
     */
    @Delete('/:workOrderId/cancel')
    @ApiBody({ isArray: false, type: ServiceAppointmentCreateDto })
    @UseGuards(PrincipalGuard)
    public async cancelWorkOrderByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    ): Promise<any> {
        return await this.workOrderService.cancelWorkOrderByPrincipalAndId(principal, workOrderId);
    }

    /**
     *
     * @param principal
     * @param workOrderId
     * @param templateKey
     * @param body
     */
    @Post('/:workOrderId/email/:templateKey')
    @ApiBody({ isArray: false, type: SendgridEmailEntity })
    @UseGuards(PrincipalGuard)
    public async sendWorkOrderEmail(
        @Principal() principal: OrganizationUserEntity,
        @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
        @Param('templateKey') templateKey: string,
        @Body() body: SendgridEmailEntity,
    ): Promise<any> {
        return await this.workOrderService.sendEmail(
            principal,
            workOrderId,
            templateKey,
            body,
        );
    }

}
