import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServiceAppointmentsService } from './service.appointments.service';
import { ServiceAppointmentCreateDto } from './types/service.appointment.create.dto';


@ApiTags('Service Appointment')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/ServiceAppointment`)
export class ServiceAppointmentsController {

    public constructor(private readonly serviceAppointmentsService: ServiceAppointmentsService) {
        this.serviceAppointmentsService = serviceAppointmentsService;
    }

    /**
     *
     * @param principal
     * @param query
     */
    @Get('/calendar')
    @ApiQuery({ name: 'end', example: '2020-06-15', required: true })
    @ApiQuery({ name: 'start', example: '2020-06-10', required: true })
    @UseGuards(PrincipalGuard)
    public async getAvailabilityByOrganization(
        @Principal() principal: OrganizationUserEntity,
        @Query() query,
    ): Promise<any> {
        return await this.serviceAppointmentsService.getAvailabilityByOrganization(
            principal,
            query,
        );
    }


    /**
     *
     * @param principal
     * @param workOrderId
     * @param body
     */
    @Post('WorkOrder/:workOrderId/reserve')
    @ApiBody({ type: ServiceAppointmentCreateDto, description: 'create a service appointment for a work order' })
    @UseGuards(PrincipalGuard)
    public async createServiceAppointmentForWorkOrder(
        @Principal() principal: OrganizationUserEntity,
        @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
        @Body() body: ServiceAppointmentCreateDto,
    ): Promise<any> {
        return await this.serviceAppointmentsService.createServiceAppointmentForWorkOrder(
            principal,
            workOrderId,
            body,
        );
    }

    /**
     *
     * @param principal
     * @param serviceAppointmentId
     * @param body
     */
    @Delete('db-associations/:serviceAppointmentId')
    @UseGuards(PrincipalGuard)
    public async cancelServiceAppointmentForWorkOrder(
        @Principal() principal: OrganizationUserEntity,
        @Param('serviceAppointmentId', ParseUUIDPipe) serviceAppointmentId: string,
        @Body() body: any,
    ): Promise<IDbRecordCreateUpdateRes[]> {
        return await this.serviceAppointmentsService.cancelServiceAppointmentForWorkOrder(
            principal,
            serviceAppointmentId,
            body,
        );
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
        return await this.serviceAppointmentsService.sendEmail(
            principal,
            workOrderId,
            templateKey,
            body,
        );
    }

}
