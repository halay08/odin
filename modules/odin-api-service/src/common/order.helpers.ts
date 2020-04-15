import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { forwardRef, Inject } from '@nestjs/common';
import { validateItemToProvision } from '../network/adtran/onu/validators/order.item.validators';


const SPLIT_ORDER = 'SplitOrder';
const { PRODUCT, CUSTOMER_DEVICE_ONT, WORK_ORDER, ORDER, ADDRESS, SERVICE } = SchemaModuleEntityTypeEnums;


interface ICustomerPhonePorting {
    AreaCode: string;
    CountryCode: string;
    SubscriberNumber: string;
}

interface IRecordsForProvisioning {
    order: DbRecordEntityTransform,
    ontDevice: DbRecordEntityTransform,
    service: DbRecordEntityTransform,
    workOrder: DbRecordEntityTransform,
    address: DbRecordEntityTransform
}

interface IRecordsForSipwiseSetup {
    order: DbRecordEntityTransform,
    orderItems: DbRecordEntityTransform[],
    orderContact: DbRecordEntityTransform
}

export class OrderHelpers {
    private dbService: DbService;


    constructor(@Inject(forwardRef(() => DbService)) dbService: DbService) {
        this.dbService = dbService;
    }


    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getOrderItemVoiceService(
        principal: OrganizationUserEntity,
        odnOrderId: string,
    ): Promise<DbRecordEntityTransform> {

        const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            odnOrderId,
            [ 'OrderItem' ],
        );

        const orderOrderItem = order['OrderItem'].dbRecords;

        const voiceItem = orderOrderItem.filter(elem => getProperty(elem, 'ProductCategory') === 'VOICE');

        if(!voiceItem) {

            throw new ExceptionType(422, 'This order is missing a voice product');
        }
        // 2.1 Get the order item & product
        const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            voiceItem[0].id,
            [ 'Product' ],
        );
        const orderItemProduct = orderItem['Product'].dbRecords;

        // 2.2 get the product & service
        const product = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            orderItemProduct[0].id,
            [ 'Service' ],
        );
        const productService = product['Service'].dbRecords;

        if(!productService) {
            throw new ExceptionType(422, 'This product is missing a service');
        }

        return productService[0];
    }

    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getOrderItemBroadbandService(
        principal: OrganizationUserEntity,
        odnOrderId: string,
    ): Promise<DbRecordEntityTransform> {

        const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            odnOrderId,
            [ 'OrderItem' ],
        );

        const orderOrderItem = order['OrderItem'].dbRecords;

        const broadbandItem = orderOrderItem.filter(elem => getProperty(elem, 'ProductCategory') === 'BROADBAND');

        if(!broadbandItem) {

            throw new ExceptionType(422, 'This order is missing a broadband product');
        }
        // 2.1 Get the order item & product
        const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            broadbandItem[0].id,
            [ 'Product' ],
        );
        const orderItemProduct = orderItem['Product'].dbRecords;

        // 2.2 get the product & service
        const product = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            orderItemProduct[0].id,
            [ 'Service' ],
        );
        const productService = product['Service'].dbRecords;

        if(!productService) {
            throw new ExceptionType(422, 'This product is missing a service');
        }

        return productService[0];
    }

    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getOrderCustomerDeviceOnt(
        principal: OrganizationUserEntity,
        odnOrderId: string,
    ): Promise<DbRecordEntityTransform> {

        const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            odnOrderId,
            [ 'OrderItem' ],
        );

        const orderOrderItem = order['OrderItem'].dbRecords;

        const baseBroadbandProduct = orderOrderItem.filter(elem => getProperty(
            elem,
            'ProductCategory',
        ) === 'BROADBAND' && getProperty(elem, 'ProductType') === 'BASE_PRODUCT');

        if(!baseBroadbandProduct[0]) {

            throw new ExceptionType(422, 'This order is missing a broadband base product');
        }
        // 2.1 Get the order item & product
        const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            baseBroadbandProduct[0].id,
            [ 'CustomerDeviceOnt' ],
        );
        const orderItemOnt = orderItem['CustomerDeviceOnt'].dbRecords;

        if(!orderItemOnt) {
            throw new ExceptionType(422, 'This order item is missing an ONT');
        }

        return orderItemOnt[0];
    }


    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getOrderAddressCustomerDevices(
        principal: OrganizationUserEntity,
        odnOrderId: string,
    ): Promise<DbRecordEntityTransform[]> {

        const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            odnOrderId,
            [ 'Address' ],
        );

        const orderAddress = order['Address'].dbRecords;

        // 2.1 Get the address and devices
        const address = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            orderAddress[0].id,
            [ 'CustomerDeviceOnt' ],
        );
        const addressOnt = address['CustomerDeviceOnt'].dbRecords;

        if(!addressOnt) {
            throw new ExceptionType(422, 'This address is missing an ONT');
        }

        return addressOnt;
    }


    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getOrderAddressFromOrderItemId(
        principal: OrganizationUserEntity,
        orderItemId: string,
    ): Promise<DbRecordEntityTransform> {

        const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            orderItemId,
            [ 'Order' ],
        );
        const orderItemOrder = orderItem['Order'].dbRecords;

        const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            orderItemOrder[0].id,
            [ 'Address' ],
        );

        const address = order['Address'].dbRecords;

        return address ? address[0] : undefined;
    }

    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getOrderItemPhoneNumberToPort(
        principal: OrganizationUserEntity,
        orderOrderItems: DbRecordEntityTransform[],
    ): Promise<ICustomerPhonePorting | undefined> {

        try {
            const voiceItem = orderOrderItems.filter(elem => getProperty(elem, 'ProductCategory') === 'VOICE');

            if(!voiceItem) {
                throw new ExceptionType(422, 'This order is missing a voice product');
            }
            // 2.1 Get the OrderItem and CustomerPhonePorting entry if exists
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                voiceItem[0].id,
                [ 'CustomerPhonePorting' ],
            );
            const customerPhonePorting = orderItem['CustomerPhonePorting'].dbRecords;

            return customerPhonePorting ? customerPhonePorting[0] : undefined;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param orderItemId
     * @private
     */
    public async getRecordsForProvisioning(
        principal: OrganizationUserEntity,
        orderItemId: string,
    ): Promise<IRecordsForProvisioning> {
        try {
            // get the work order order item
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemId,
                [ PRODUCT, CUSTOMER_DEVICE_ONT, WORK_ORDER, ORDER ],
            );

            const ontDevice = orderItem[CUSTOMER_DEVICE_ONT].dbRecords;
            const workOrders = orderItem[WORK_ORDER].dbRecords;
            const product = orderItem[PRODUCT].dbRecords;
            const order = orderItem[ORDER].dbRecords;

            if(!workOrders) {
                throw new ExceptionType(400, 'Please add this item to a work order before provisioning');
            }

            if(!ontDevice) {
                throw new ExceptionType(400, 'no ONT to prevision, please enter the device details');
            }

            if(!product) {
                throw new ExceptionType(400, 'no product related to this order item, correct and try again.');
            }

            // get product service
            const productRes = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                product[0].id,
                [ SERVICE ],
            );
            const service = productRes[SERVICE].dbRecords;

            if(!service) {
                throw new ExceptionType(400, 'no service related to this product, correct and try again.');
            }

            // get work order with order items
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrders[0].id,
                [ ADDRESS ],
            );

            const address = workOrder[ADDRESS].dbRecords;
            if(!address) {
                throw new ExceptionType(400, 'no address added to the order, add one and try again.');
            }


            // validate the item has all required fields
            await validateItemToProvision(principal, orderItem);

            console.log('itemToProvision', orderItem);

            return { order: order[0], ontDevice: ontDevice[0], service: service[0], workOrder, address: address[0] };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param odnOrderId
     * @private
     */
    public async getOrderRecordsForSettingUpSipswise(
        principal: OrganizationUserEntity,
        odnOrderId: string,
    ): Promise<IRecordsForSipwiseSetup> {

        // 1. get odin contact
        const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            odnOrderId,
            [ 'Contact', 'OrderItem' ],
        );

        const orderItems = order['OrderItem'].dbRecords;
        const orderContact = order['Contact'].dbRecords;

        return {
            order,
            orderItems,
            orderContact: orderContact[0],
        }
    }

    /**
     *
     * @param principal
     * @param orderItemId
     * @private
     */
    public async getOntFromOrderByOrderItemId(principal: OrganizationUserEntity, orderItemId: string) {
        try {
            // get the order for this order item
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemId,
                [ ORDER, SPLIT_ORDER ],
            );
            const order = orderItem[ORDER].dbRecords;
            const orderItemSplitOrder = orderItem[SPLIT_ORDER].dbRecords;

            // Check if the item has a split order
            // If it does > get the split order > get the order item with the base broadband from the order
            // provision the service

            // if there is no split order
            // then we should use the order that the voice item is being activated from
            let orderId;

            if(orderItemSplitOrder) {
                const splitOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    orderItemSplitOrder[0].id,
                    [ ORDER ],
                );

                // A split order will always have 2 orders
                // the originating order
                // and the new order after the split
                const splitOrderOrders = splitOrder[ORDER].dbRecords;
                const originatingOrder = splitOrderOrders.filter(elem => elem.id !== order[0].id);

                orderId = originatingOrder[0].id;
            } else {
                orderId = order[0].id;
            }

            // get the ont device from the base broadband order item
            return await this.getOrderCustomerDeviceOnt(principal, orderId);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


}
