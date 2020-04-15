import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { hasPermission } from '@d19n/models/dist/identity/organization/user/helpers/HasPermission';
import { hasRole } from '@d19n/models/dist/identity/organization/user/helpers/HasRole';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordColumnEntityTransform } from '@d19n/models/dist/schema-manager/db/record/column/transform/db.record.column.entity.transform';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty, getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import { getFullWeekDateRangeFromStartAndEnd } from '../helpers/DateRangeFromStartAndEnd';
import { ServiceAppointmentCreateDto } from './types/service.appointment.create.dto';

dotenv.config();

const { NOTIFICATION_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;

interface IServiceAppointmentAvailability {
    Date: string,
    AM: boolean,
    PM: boolean,
    AMCount?: number,
    PMCount?: number,
}

@Injectable()
export class ServiceAppointmentsService {

    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private schemasService: SchemasService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private amqpConnection: AmqpConnection;

    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        @Inject(forwardRef(() => DbRecordsService)) dbRecordsService: DbRecordsService,
        @Inject(forwardRef(() => SchemasService)) schemasService: SchemasService,
        amqpConnection: AmqpConnection,
    ) {
        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.dbRecordsService = dbRecordsService;
        this.schemasService = schemasService;
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param query
     * @private
     */
    public async getAvailabilityByOrganization(
        principal: OrganizationUserEntity,
        query: { start: string, end: string },
    ) {
        try {
            // construct date range
            const dateRange = this.constructDateRange(principal, query);
            // Find all existing appointments for the given date range
            let existingAppointments = await this.constructExistingAppointmentsByDate(
                principal.organization,
                dateRange,
            );
            // Build availability by date
            let availableAppointments = await this.constructAvailableAppointmentsByDate(
                principal,
                dateRange,
                existingAppointments,
            );
            // Check availability
            let hasAvailability = await this.isFirstSelectableDateAvailable(availableAppointments);
            let maxChecks = 0;
            let start = query.start;
            let end = query.end;
            while (!hasAvailability) {
                start = moment(start).add(1, 'days').format('YYYY-MM-DD');
                end = moment(end).add(1, 'days').format('YYYY-MM-DD');

                const dateRange = this.constructDateRange(principal, { start, end });
                // Find all existing appointments for the given date range
                existingAppointments = await this.constructExistingAppointmentsByDate(
                    principal.organization,
                    dateRange,
                );
                // Build availability by date
                availableAppointments = await this.constructAvailableAppointmentsByDate(
                    principal,
                    dateRange,
                    existingAppointments,
                );
                hasAvailability = await this.isFirstSelectableDateAvailable(availableAppointments);
                maxChecks = maxChecks + 1;
                if(maxChecks > 15) {
                    hasAvailability = false;
                    break;
                }
            }

            console.log('getAvailabilityByOrganization', availableAppointments);
            return availableAppointments;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }

    /**
     *
     * @param principal
     * @param dateRange
     * @param existingAptCountByDate
     */
    private constructAvailableAppointmentsByDate(
        principal: OrganizationUserEntity,
        dateRange,
        existingAptCountByDate: {},
    ) {
        const availableAppointments = [];

        // I want to blackout 3 AM and 3 PM
        const maxAvailableOnDate = {
            '2020-12-22': {
                AM: 3,
                PM: 3,
            },
            '2020-12-23': {
                AM: 3,
                PM: 3,
            },
            '2020-12-24': {
                AM: 3,
                PM: 3,
            },
            '2020-12-25': {
                AM: 0,
                PM: 0,
            },
            '2020-12-26': {
                AM: 0,
                PM: 0,
            },
            '2020-12-29': {
                AM: 3,
                PM: 3,
            },
            '2020-12-30': {
                AM: 3,
                PM: 3,
            },
            '2020-12-31': {
                AM: 3,
                PM: 3,
            },
            '2021-01-01': {
                AM: 0,
                PM: 0,
            },
            '2021-01-02': {
                AM: 0,
                PM: 0,
            },
            '2021-04-02': {
                AM: 0,
                PM: 0,
            },
            '2021-04-03': {
                AM: 0,
                PM: 0,
            },

        };

        for(const date of dateRange) {

            let maxDailyAM = hasPermission(principal, 'fieldservicemodule.serviceappointment.override') ? 9 : 9;
            let maxDailyPM = hasPermission(principal, 'fieldservicemodule.serviceappointment.override') ? 9 : 9;

            const existingBookings = existingAptCountByDate[date];

            const hasExistingBookingsAM: boolean = existingBookings && existingBookings['AM'];
            const hasExistingBookingsPM: boolean = existingBookings && existingBookings['PM'];

            const hasOverrides = maxAvailableOnDate[date];
            const hasOverridesAM: boolean = hasOverrides && maxAvailableOnDate[date]['AM'];
            const hasOverridesPM: boolean = hasOverrides && maxAvailableOnDate[date]['PM'];

            // this will override the maxDailyAM
            if(hasOverridesAM !== undefined && !hasPermission(
                principal,
                'fieldservicemodule.serviceappointment.override',
            )) {
                const maxAvailableOnDateAM = maxAvailableOnDate[date]['AM'];
                maxDailyAM = maxAvailableOnDateAM;
            }

            // this will override the maxDailyPM
            if(hasOverridesPM !== undefined && !hasPermission(
                principal,
                'fieldservicemodule.serviceappointment.override',
            )) {
                const maxAvailableOnDatePM = maxAvailableOnDate[date]['PM'];
                maxDailyPM = maxAvailableOnDatePM;
            }

            const dayOfWeek = moment(date).isoWeekday();
            let availability: IServiceAppointmentAvailability;


            if(hasPermission(principal, 'fieldservice.reporting')) {

                if(dayOfWeek === 7 || dayOfWeek === 1) {
                    availability = {
                        Date: date,
                        AM: false,
                        PM: false,
                        AMCount: 0,
                        PMCount: 0,
                    };
                } else {
                    availability = {
                        Date: date,
                        AM: hasExistingBookingsAM ? existingBookings['AM'] < maxDailyAM : maxDailyAM > 0,
                        PM: hasExistingBookingsPM ? existingBookings['PM'] < maxDailyPM : maxDailyPM > 0,
                        AMCount: hasExistingBookingsAM ? existingBookings['AM'] : 0,
                        PMCount: hasExistingBookingsPM ? existingBookings['PM'] : 0,
                    };
                }
            } else if(dayOfWeek === 7 || dayOfWeek === 1) {
                availability = {
                    Date: date,
                    AM: false,
                    PM: false,
                };
            } else {
                availability = {
                    Date: date,
                    AM: hasExistingBookingsAM ? existingBookings['AM'] < maxDailyAM : maxDailyAM > 0,
                    PM: hasExistingBookingsPM ? existingBookings['PM'] < maxDailyPM : maxDailyPM > 0,
                };

            }

            availableAppointments.push(availability);
        }

        return availableAppointments;
    }

    /**
     *
     * @param organization
     * @param dateRange
     */
    private async constructExistingAppointmentsByDate(
        organization: OrganizationEntity,
        dateRange: any,
    ) {
        const { serviceAppointmentSchema, existingAppointments } = await this.findExistingAppointmentsByDateRange(
            organization,
            dateRange,
        );

        let existingAptCountByDate = {};
        for(const apt of existingAppointments) {
            const parsedApt = DbRecordColumnEntityTransform.transform(
                apt.columns,
                serviceAppointmentSchema.columns,
            );
            if(existingAptCountByDate[parsedApt['Date']]) {
                if(existingAptCountByDate[parsedApt['Date']][parsedApt['TimeBlock']]) {
                    // increment existing type
                    existingAptCountByDate[parsedApt['Date']][parsedApt['TimeBlock']] += 1;
                } else {
                    // Set initial type
                    existingAptCountByDate[parsedApt['Date']][parsedApt['TimeBlock']] = 1;
                }
            } else {
                // Set initial date and type
                existingAptCountByDate = Object.assign({}, existingAptCountByDate, {
                    [parsedApt['Date']]: {
                        [parsedApt['TimeBlock']]: 1,
                    },
                });
            }
        }

        return existingAptCountByDate;
    }

    /**
     *
     * @param principal
     * @param query
     */
    private constructDateRange(principal: OrganizationUserEntity, query: { start: string, end: string }): string[] {
        let dateRange;
        const minimumStart = '2020-10-27'; // set first available booking date
        const now = moment().format('YYYY-MM-DD');

        if(!moment(query.start).isValid() || !moment(query.end).isValid()) {
            throw new ExceptionType(400, 'date is not in correct format YYYY-MM-DD');
        }
        // Dates should not be less than 14 days from the query start
        // Date should not be less than 7 days from the minimum start

        // if the query start date is before the minimum start date
        // and if the minimum start date is more than 14 days from now
        // add a 7 day buffer to the minimum start date
        if(moment(query.start).isBefore(minimumStart)
            && moment(now).add(14, 'days').isBefore(minimumStart)
            && !hasRole(principal, 'FieldServiceAdmin')
        ) {

            const adjEndDate = moment(minimumStart).add(7, 'days').format('YYYY-MM-DD');
            dateRange = getFullWeekDateRangeFromStartAndEnd(minimumStart, adjEndDate);

        } else if(moment(now).add(14, 'days').isAfter(query.start)
            && !hasRole(principal, 'FieldServiceAdmin')
        ) {

            // find the difference of the query start date and 14 days from now
            const diffInDays = moment(moment(now).add(14, 'days')).diff(query.start, 'days');

            // if the difference is a positive number then the query start date is in inside of 14 days and we want to
            // add the difference so the startDate is a minimum of 14 days from today.
            const adjStartDate = moment(query.start).add(diffInDays, 'days').format('YYYY-MM-DD');

            // get the end date which would be 7 days from the start date
            const adjEndDate = moment(adjStartDate).add(7, 'days').format('YYYY-MM-DD');

            dateRange = getFullWeekDateRangeFromStartAndEnd(adjStartDate, adjEndDate);

        } else {
            dateRange = getFullWeekDateRangeFromStartAndEnd(query.start, query.end);
        }

        // Validation
        if(dateRange.length > 31) {
            throw new ExceptionType(500, 'maximum range of 1 month');
        }
        return dateRange;
    }

    /**
     *
     * @param organization
     * @param dateRange
     */
    private async findExistingAppointmentsByDateRange(organization: OrganizationEntity, dateRange: string[]) {

        const serviceAppointmentSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
            organization,
            `${SchemaModuleTypeEnums.FIELD_SERVICE_MODULE}:${SchemaModuleEntityTypeEnums.SERVICE_APPOINTMENT}`,
        );

        const dateColumn = serviceAppointmentSchema.columns.find(elem => elem.name === 'Date');

        const existingAppointments = await this.dbRecordsService.getDbRecordsByColumnAndValues(
            organization,
            {
                schemaColumnId: dateColumn.id,
                values: dateRange,
            },
        );
        return { serviceAppointmentSchema, existingAppointments };
    }

    /**
     *
     * @param availableAppointments
     */
    private async isFirstSelectableDateAvailable(availableAppointments: { Date: string, AM: boolean, PM: boolean }[]) {
        const firstApt = availableAppointments[0];

        return firstApt.AM || firstApt.PM;
    }


    /**
     *
     * @param workOrderId
     * @param body
     * @param principal
     */
    public async createServiceAppointmentForWorkOrder(
        principal: OrganizationUserEntity,
        workOrderId: string,
        body: ServiceAppointmentCreateDto,
    ) {
        try {

            const { SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

            if(!body['Date'] || !body['TimeBlock']) {
                throw new ExceptionType(400, 'missing complete Date and TimeBlock');
            }
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ SERVICE_APPOINTMENT ],
            );
            // Create Service Appointment
            const serviceAppointment = new DbRecordCreateUpdateDto();
            serviceAppointment.entity = `${FIELD_SERVICE_MODULE}:${SERVICE_APPOINTMENT}`;
            serviceAppointment.properties = {
                Date: body['Date'],
                TimeBlock: body['TimeBlock'],
            };
            serviceAppointment.associations = [
                {
                    recordId: workOrderId,
                },
            ];
            // validate that this can be reserved
            const isAvailable = await this.isAppointmentAvailable(principal, body);

            if(workOrder[SERVICE_APPOINTMENT].dbRecords && workOrder[SERVICE_APPOINTMENT].dbRecords.length > 0) {
                throw new ExceptionType(409, 'cannot have two appointments scheduled, cancel the previous and rebook');
            }

            if(isAvailable) {
                return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                    principal,
                    [ serviceAppointment ],
                    { upsert: false },
                );
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }

    /**
     *
     * @param principal
     * @param body
     */
    private async isAppointmentAvailable(
        principal: OrganizationUserEntity,
        body: ServiceAppointmentCreateDto,
    ) {

        const availableAppointments = await this.getAvailabilityByOrganization(
            principal,
            { start: body['Date'], end: body['Date'] },
        );

        const hasMatchingDate = availableAppointments.find(elem => elem.Date === body['Date'] && elem[body['TimeBlock']]);

        if(!hasMatchingDate) {
            throw new ExceptionType(
                400,
                `no appointments available on ${body['Date']}`,
                [],
                { availableAppointments },
            );
        } else {
            return true;
        }
    }

    /**
     * templateLabels:
     * SENDGRID_WORK_ORDER_STAGE_CHANGE
     * SENDGRID_WORK_ORDER_CONFIRMATION
     * SENDGRID_WORK_ORDER_CANCELED_CONFIRMATION
     *
     * @param principal
     * @param workOrderId
     * @param templateLabel
     * @param body
     */
    public async sendEmail(
        principal: OrganizationUserEntity,
        workOrderId: string,
        templateLabel: string,
        body?: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const { CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT ],
            );

            await this.validateEmail(workOrder);

            const workOrderAddress = workOrder[ADDRESS];
            const workOrderServiceApp = workOrder[SERVICE_APPOINTMENT];
            const workOrderItems = workOrder[ORDER_ITEM];


            const newEmail = new SendgridEmailEntity();
            newEmail.to = getPropertyFromRelation(workOrder, CONTACT, 'EmailAddress');
            newEmail.from = principal.organization.billingReplyToEmail;
            newEmail.templateLabel = templateLabel;
            newEmail.dynamicTemplateData = Object.assign({}, {
                recordId: workOrderId,
                recordNumber: workOrder.recordNumber,
                contactFirstName: getPropertyFromRelation(workOrder, CONTACT, 'FirstName'),
                address: workOrderAddress.dbRecords[0]['properties'],
                workOrder: workOrder['properties'],
                serviceAppointment: Object.assign({}, workOrderServiceApp.dbRecords[0].properties, {
                    Date: moment(getPropertyFromRelation(workOrder, SERVICE_APPOINTMENT, 'Date')).format(
                        'DD-MM-YYYY'),
                    TimeRange: getPropertyFromRelation(
                        workOrder,
                        SERVICE_APPOINTMENT,
                        'TimeBlock',
                    ) === 'AM' ? '8am - 1pm' : '1pm - 6pm',
                }),
                currentStage: workOrder.stage.name,
                orderItems: workOrderItems.dbRecords.map(elem => ({
                    lineItemName: elem.title,
                    lineItemQuantity: getProperty(elem, 'Quantity'),
                    lineItemDescription: getProperty(elem, 'Description'),
                })),
                organizationName: principal.organization.name,
            }, body ? body.dynamicTemplateData : {});

            await this.amqpConnection.publish(
                NOTIFICATION_MODULE,
                `${NOTIFICATION_MODULE}.${SUB_SEND_DYNAMIC_EMAIL}`,
                {
                    principal,
                    body: newEmail,
                },
            )

            return { status: 'processed' };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param workOrder
     */
    private async validateEmail(workOrder: DbRecordEntityTransform) {

        const { CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

        const workOrderAddress = workOrder[ADDRESS];
        const workOrderServiceApp = workOrder[SERVICE_APPOINTMENT];
        const workOrderItems = workOrder[ORDER_ITEM];
        const contact = workOrder[CONTACT];

        if(!contact) {
            throw new ExceptionType(400, 'no contact, cannot send confirmation');
        }
        if(!workOrderItems) {
            throw new ExceptionType(400, 'no order items, cannot send confirmation');
        }
        if(!workOrderAddress) {
            throw new ExceptionType(400, 'no address, cannot send confirmation');
        }
        if(!workOrderServiceApp) {
            throw new ExceptionType(400, 'no service appointment, cannot send confirmation');
        }
    }

    /**
     *
     * @param principal
     * @param dbRecordAssociationId
     * @param body
     */
    async cancelServiceAppointmentForWorkOrder(
        principal: OrganizationUserEntity,
        serviceAppointmentId: string,
        body: DbRecordCreateUpdateDto,
    ): Promise<IDbRecordCreateUpdateRes[]> {
        try {

            const serviceAppointment = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                serviceAppointmentId,
                [ 'WorkOrder' ],
            );

            await this.dbService.deleteByPrincipalAndId(principal, serviceAppointmentId);

            // Create Cancellation Reason
            const cancellationReason = new DbRecordCreateUpdateDto();
            cancellationReason.entity = `${FIELD_SERVICE_MODULE}:CancellationReason`;
            cancellationReason.properties = body.properties;
            cancellationReason.associations = [
                {
                    recordId: serviceAppointment.WorkOrder.dbRecords[0].id,
                },
            ];

            return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ cancellationReason ],
                { upsert: false },
            );
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

}
