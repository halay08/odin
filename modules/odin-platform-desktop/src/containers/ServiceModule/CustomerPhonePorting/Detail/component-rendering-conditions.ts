import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';

export function showPhonePortingModal(record: DbRecordEntityTransform) {
  if(record) {
    const orderId = getProperty(record, 'MagraOrderId');
    return orderId ? false : true;
  } else {
    return false;
  }
}

