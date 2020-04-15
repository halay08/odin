import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';

/**
 *
 * @param workOrder
 */
export function validateEmail(workOrder: DbRecordEntityTransform) {

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
