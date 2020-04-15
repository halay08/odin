import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';


@ApiTags('Invoices')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/invoices`)
export class InvoicesController {

    public constructor(private readonly invoicesService: InvoicesService) {
        this.invoicesService = invoicesService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param body
     */
    @ApiBody({ isArray: true, type: DbRecordAssociationCreateUpdateDto })
    @Post('orders/:orderId')
    @UseGuards(PrincipalGuard)
    public async createInvoiceFromOrder(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() body: DbRecordAssociationCreateUpdateDto[],
    ): Promise<any> {
        return await this.invoicesService.createInvoiceFromOrder(principal, orderId, body);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param invoiceId
     * @param templateKey
     * @param body
     */
    @Post(':invoiceId/void')
    @UseGuards(PrincipalGuard)
    public async voidInvoiceById(
        @Principal() principal: OrganizationUserEntity,
        @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
        @Body() body: SendgridEmailEntity,
    ): Promise<any> {
        return await this.invoicesService.voidInvoiceById(principal, invoiceId, body);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param invoiceId
     * @param templateKey
     * @param body
     */
    @Post(':invoiceId/email/:templateKey')
    @UseGuards(PrincipalGuard)
    public async createOrderItemsFromProducts(
        @Principal() principal: OrganizationUserEntity,
        @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
        @Param('templateKey') templateKey: string,
        @Body() body: SendgridEmailEntity,
    ): Promise<any> {
        return await this.invoicesService.sendEmail(principal, invoiceId, templateKey, body);
    }

}
