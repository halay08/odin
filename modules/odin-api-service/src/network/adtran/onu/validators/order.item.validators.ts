import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';

const { CUSTOMER_DEVICE_ONT, PRODUCT } = SchemaModuleEntityTypeEnums;

/**
 *
 * @param principal
 * @param workOrderOrderItems
 * @private
 */
export async function validateItemToProvision(
    principal: OrganizationUserEntity,
    workOrderOrderItem: DbRecordEntityTransform,
) {

    // check that items exist
    if(!workOrderOrderItem) {
        throw new ExceptionType(400, 'no order item on the work order, please add them');
    }


    const productCategory = getPropertyFromRelation(workOrderOrderItem, PRODUCT, 'Category');

    // Check that the ONT has values
    if(!workOrderOrderItem[CUSTOMER_DEVICE_ONT].dbRecords && productCategory === 'BROADBAND') {
        throw new ExceptionType(400, `No ONT added for order item ${workOrderOrderItem.title}`);
    } else if(workOrderOrderItem[CUSTOMER_DEVICE_ONT].dbRecords && productCategory === 'BROADBAND') {
        // Verify ponSerialNumber
        const serialNumber = getPropertyFromRelation(workOrderOrderItem, CUSTOMER_DEVICE_ONT, 'SerialNumber');

        if(!serialNumber || serialNumber.length < 5) {
            throw new ExceptionType(
                400,
                `ONT serial number empty or invalid for order item ${workOrderOrderItem.title}`,
            );
        }
    } else if(productCategory === 'VOICE') {
        // Verify voice provisioning

    } else if(productCategory !== 'BROADBAND' && productCategory !== 'VOICE') {
        throw new ExceptionType(
            400,
            `cannot request provisioning for this item ${workOrderOrderItem.title}`,
        );
    }
}
