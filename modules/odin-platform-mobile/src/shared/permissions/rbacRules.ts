import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaEntityTransform } from '@d19n/models/dist/schema-manager/schema/transform/schema.entity.transform';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import moment from 'moment';
import { splitModuleAndEntityName } from '../utilities/recordHelpers';

const BILLING_ADJUSTMENT = 'BillingAdjustment';
const { INVOICE, TRANSACTION, PAYMENT_METHOD, DISCOUNT } = SchemaModuleEntityTypeEnums;

/**
 *
 * @param authUser
 * @param moduleName
 */
export const canUserAccessModule = (authUser: any, moduleName: string) => {
  if(!!authUser && !!authUser.permissions && authUser.permissions.length > 0)
    return authUser.permissions.includes(`${moduleName.toLowerCase()}.access`)
  else
    return false
}


/**
 * returns true if the user has the necessary permissions
 * returns false if the user does not have necessary permissions
 *
 * @param authUser
 * @param schema
 * @param recordAction
 */
export const canUserPerformAction = (
  authUser: any,
  schema: SchemaEntity | SchemaEntityTransform | undefined,
  recordAction: 'search' | 'get' | 'create' | 'update' | 'delete' | 'merge',
): boolean => {


  // If the user has no permissions do not allow access to anything
  if(authUser && authUser.permissions && authUser.permissions.length < 1) {
    //console.log('NO USER PERMISSIONS')
    return false;

  }

  if(!schema) {
    console.log('NO SCHEMA')

    return false;

  }

  // we only want to check permissions if the schema has permissions
  if(schema && schema.permissions && schema.permissions.length > 0) {

    if(schema as SchemaEntity) {

      return authUser.permissions.map((elem: any) => elem).includes(`${schema?.moduleName?.toLowerCase()}.${schema?.entityName?.toLowerCase()}.${recordAction}`)

    } else if(schema as SchemaEntityTransform) {

      return authUser.permissions.includes(`${schema?.moduleName?.toLowerCase()}.${schema?.entityName?.toLowerCase()}.${recordAction}`)
    }
  }

  console.log('NO OTHER CONDITIONS')

  return true;

}

export const canUserSearchRecord = (authUser: any, schema: SchemaEntity | SchemaEntityTransform) => {
  return canUserPerformAction(authUser, schema, 'search')
}

export const canUserGetRecord = (authUser: any, schema: SchemaEntity | SchemaEntityTransform | undefined) => {
  return canUserPerformAction(authUser, schema, 'get')
}

export const canUserCreateRecord = (authUser: any, schema: SchemaEntity | SchemaEntityTransform | undefined) => {
  return canUserPerformAction(authUser, schema, 'create')
}

/**
 * Uses the merge permission
 * @param authUser
 * @param schema
 * @param dbRecord
 */
export const canUserCloneRecord = (
  authUser: any,
  schema: SchemaEntity | SchemaEntityTransform | undefined,
  dbRecord?: DbRecordEntityTransform,
) => {
  const canActivate = canUserPerformAction(authUser, schema, 'merge');

  if(dbRecord && canActivate) {
    // if there is a record and the user canActivate
    // then we want to verify the record is in an actionable state
    const isActionable = isRecordActionable(authUser, dbRecord);

    return isActionable;
  }

  return canActivate;
}

/**
 *
 * @param authUser
 * @param schema
 * @param dbRecord
 */
export const canUserUpdateRecord = (
  authUser: any,
  schema: SchemaEntity | SchemaEntityTransform | undefined,
  dbRecord?: DbRecordEntityTransform,
) => {

  const canActivate = canUserPerformAction(authUser, schema, 'update');

  console.log('canActivate', canActivate);

  if(dbRecord && canActivate) {
    // if there is a record and the user canActivate
    // then we want to verify the record is in an actionable state
    return isRecordActionable(authUser, dbRecord);

  }

  return canActivate;
}
/**
 *
 * @param authUser
 * @param schema
 * @param dbRecord
 */
export const canUserDeleteRecord = (
  authUser: any,
  schema: SchemaEntity | SchemaEntityTransform | undefined,
  dbRecord?: DbRecordEntityTransform,
) => {

  const canActivate = canUserPerformAction(authUser, schema, 'delete');

  if(dbRecord && canActivate) {
    // if there is a record and the user canActivate
    // then we want to verify the record is in an actionable state
    const isActionable = isRecordActionable(authUser, dbRecord);

    return isActionable;
  }

  return canActivate;
}

export const canUserMergeRecord = (authUser: any, schema: SchemaEntity | SchemaEntityTransform) => {
  return canUserPerformAction(authUser, schema, 'merge')
}

/**
 *
 * @param authUser
 * @param schema
 * @param propertyName
 */
export const canUserDeleteProperty = (authUser: any, schema: any, propertyName: string) => {
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return authUser.roles.includes('${schema.moduleName}.${schema.entityName}.${propertyName}.${action}');
  }
  return false;
};

/**
 *
 * @param authUser
 * @param schema
 * @param propertyName
 */
export const canUserCreateProperty = (authUser: any, schema: any, propertyName: string) => {
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return authUser.roles.includes('${schema.moduleName}.${schema.entityName}.${propertyName}.${action}');
  }
  return false;
};


/**
 *
 * @param authUser
 */
export const isUserAuthenticated = (authUser?: any) => {

  const tokenExpiresAt = localStorage.getItem(`tokenExpiresAt`);
  const isAfter = moment(moment().add(10, 'minutes').toISOString()).isAfter(tokenExpiresAt);

  if(isAfter || !tokenExpiresAt) {

    localStorage.removeItem(`token`);
    localStorage.removeItem(`tokenExpiresAt`);

    return false;

  }

  return true;
};

/**
 *
 * @param authUser
 */
export const isSystemAdmin = (authUser?: any) => {

  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return authUser.roles.includes('system.admin');
  }

  return true;
};


/**
 *
 * @param userReducer
 * @param record
 */
const isRecordActionable = (userReducer: any, record: DbRecordEntityTransform) => {
  // if the user is a system administrator do not disable;
  const { entityName } = splitModuleAndEntityName(record.entity);
  // @ts-ignore
  const entityInArray = [ INVOICE, TRANSACTION, PAYMENT_METHOD ].includes(entityName);
  // @ts-ignore
  const excludeAlways = [ BILLING_ADJUSTMENT, DISCOUNT ].includes(entityName);

  if(excludeAlways) {

    return true;
  } else if(isSystemAdmin(userReducer)) {

    return true;
  } else if(record?.stage?.isSuccess || record?.stage?.isFail) {

    return false;
  } else if(entityName && entityInArray) {
    // some entities should not be deletable
    return false;
  }

  return true;
};


