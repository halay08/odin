import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';

// Broadband products
export function showNetworkTab(record: DbRecordEntityTransform) {
  if(record) {
    const productCategory = getProperty(record, 'ProductCategory');
    return productCategory === 'BROADBAND';
  } else {
    return false;
  }
}

export function showCustomerDeviceOnt(record: DbRecordEntityTransform) {
  if(record) {
    const productType = getProperty(record, 'ProductType');
    const productCategory = getProperty(record, 'ProductCategory');
    return productType === 'BASE_PRODUCT' && productCategory === 'BROADBAND';
  } else {
    return false;
  }
}

export function showCustomerDeviceRouter(record: DbRecordEntityTransform) {
  if(record) {
    const productCategory = getProperty(record, 'ProductCategory');
    return productCategory === 'BROADBAND';
  } else {
    return false;
  }
}

// Voice products
export function showVoiceTab(record: DbRecordEntityTransform) {
  if(record) {
    const productCategory = getProperty(record, 'ProductCategory');
    return productCategory === 'VOICE';
  } else {
    return false;
  }
}

export function showCustomerPhonePorting(record: DbRecordEntityTransform) {
  if(record) {
    const productCategory = getProperty(record, 'ProductCategory');
    return productCategory === 'VOICE';
  } else {
    return false;
  }
}
