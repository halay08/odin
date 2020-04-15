// export enum SchemaModuleTypes {
//
//     CRM = "CRM", // Customer Relationship Management
//     ORM = "ORM", // Order Management
//     PCM = "PCM", // Product Catalog Management
//     BRM = "BRM", // Billing Revenue Management
//
// }

// export const SCHEMA_MODULE_TYPE_KEYS: Array<string> = Object.values(SchemaModuleTypes);

interface SchemaModuleType {
  name: string;
  label: string;
}

/**
 * Modules configurable by the user
 */
export enum SchemaModuleTypeEnums {
  CRM_MODULE = 'CrmModule',
  ORDER_MODULE = 'OrderModule',
  FIELD_SERVICE_MODULE = 'FieldServiceModule',
  PRODUCT_MODULE = 'ProductModule',
  BILLING_MODULE = 'BillingModule',
  NOTIFICATION_MODULE = 'NotificationModule',
  SUPPORT_MODULE = 'SupportModule',
  SERVICE_MODULE = 'ServiceModule',
  PROJECT_MODULE = 'ProjectModule',
  IDENTITY_MODULE = 'IdentityModule',
  SCHEMA_MODULE = 'SchemaModule'
}

export const SchemaModuleTypes: { [name: string]: SchemaModuleType } = {

  FIELD_SERVICE_MODULE: {
    name: 'field service module',
    label: 'FieldServiceModule',
  },
  CRM_MODULE: {
    name: 'crm module',
    label: 'CrmModule',
  },
  ORDER_MODULE: {
    name: 'order module',
    label: 'OrderModule',
  },
  PRODUCT_MODULE: {
    name: 'product module',
    label: 'ProductModule',
  },
  BILLING_MODULE: {
    name: 'billing module',
    label: 'BillingModule',
  },
  NOTIFICATION_MODULE: {
    name: 'notification module',
    label: 'NotificationModule',
  },
  SUPPORT_MODULE: {
    name: 'support module',
    label: 'SupportModule',
  },
  PROJECT_MODULE: {
    name: 'project module',
    label: 'ProjectModule',
  },
  SCHEMA_MODULE: {
    name: 'schema module',
    label: 'SchemaModule',
  },
};

/**
 * Array of keys to validate @IsIn() enum class validator
 */
export const SCHEMA_MODULE_TYPE_KEYS = Object.keys(SchemaModuleTypes);

/**
 * Get the module entity name using the key
 * @param key
 */
export const getSchemaModuleName = (key: string): string | undefined => {
  const entity = SchemaModuleTypes[key];
  if(entity) {
    return entity.name
  } else {
    return undefined;
  }
};


/**
 * Get the module entity label using the key
 * @param key
 */
export const getSchemaModuleLabel = (key: string): string | undefined => {
  const entity = SchemaModuleTypes[key];
  if(entity) {
    return entity.label
  } else {
    return undefined;
  }
};
