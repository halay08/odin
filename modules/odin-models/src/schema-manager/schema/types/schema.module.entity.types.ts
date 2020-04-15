class SchemaModuleEntity {
  public name: string;
  public label: string;
  public prefix: string;
}

export enum SchemaModuleEntityTypeEnums {

  PRODUCT = 'Product',
  PRODUCT_COMPONENT = 'ProductComponent',
  RESTRICTION = 'Restriction',
  DISCOUNT = 'Discount',
  OFFER = 'Offer',
  CONSUMPTION_SCHEDULE = 'ConsumptionSchedule',
  CONSUMPTION_RATE = 'ConsumptionRate',
  LEAD = 'Lead',
  NOTE = 'Note',
  ACCOUNT = 'Account',
  CONTACT = 'Contact',
  CONTACT_IDENTITY = 'ContactIdentity',
  ORGANIZATION = 'Organization',
  ADDRESS = 'Address',
  ORDER = 'Order',
  ORDER_ITEM = 'OrderItem',
  RETURN_ORDER = 'ReturnOrder',
  RETURN_ORDER_ITEM = 'ReturnOrderItem',
  SPLIT_ORDER = 'SplitOrder',
  INVOICE = 'Invoice',
  INVOICE_ITEM = 'InvoiceItem',
  TRANSACTION = 'Transaction',
  PAYMENT_METHOD = 'PaymentMethod',
  WORK_ORDER = 'WorkOrder',
  SERVICE_APPOINTMENT = 'ServiceAppointment',
  NETWORK_DEVICE = 'NetworkDevice',
  CUSTOMER_DEVICE_ROUTER = 'CustomerDeviceRouter',
  CUSTOMER_DEVICE_ONT = 'CustomerDeviceOnt',
  SERVICE = 'Service',
  PROGRAM = 'Program',
  PROJECT = 'Project',
  MILESTONE = 'Milestone',
  MILESTONE_TEMPLATE = 'MilestoneTemplate',
  FEATURE = 'Feature',
  FEATURE_TEMPLATE = 'FeatureTemplate',
  TASK = 'Task',
  TASK_TEMPLATE = 'TaskTemplate',
  SUBTASK = 'Subtask',
  FILE = 'File',

}

export const SchemaModuleEntityTypes: { [name: string]: SchemaModuleEntity } = {

  // Product Catalog
  PRODUCT: {
    name: 'product',
    label: 'Product',
    prefix: 'SKU',
  },
  PRODUCT_COMPONENT: {
    name: 'product component',
    label: 'ProductComponent',
    prefix: 'SKU-COMP',
  },
  RESTRICTION: {
    name: 'restriction',
    label: 'Restriction',
    prefix: 'RN',
  },
  DISCOUNT: {
    name: 'discount',
    label: 'Discount',
    prefix: 'DT',
  },
  OFFER: {
    name: 'offer',
    label: 'Offer',
    prefix: 'OFR',
  },
  CONSUMPTION_SCHEDULE: {
    name: 'consumption schedule',
    label: 'ConsumptionSchedule',
    prefix: '',
  },
  CONSUMPTION_RATE: {
    name: 'consumption rate',
    label: 'ConsumptionRate',
    prefix: 'CR',
  },

  // CRM
  LEAD: {
    name: 'lead',
    label: 'Lead',
    prefix: 'LD',
  },
  ACCOUNT: {
    name: 'account',
    label: 'Account',
    prefix: 'ACT',
  },
  CONTACT: {
    name: 'contact',
    label: 'Contact',
    prefix: '',
  },
  CONTACT_IDENTITY: {
    name: 'contact identity',
    label: 'ContactIdentity',
    prefix: '',
  },
  ORGANIZATION: {
    name: 'organization',
    label: 'Organization',
    prefix: '',
  },
  ADDRESS: {
    name: 'address',
    label: 'Address',
    prefix: '',
  },

  // Order management
  ORDER: {
    name: 'order',
    label: 'Order',
    prefix: 'OR',
  },
  ORDER_ITEM: {
    name: 'order item',
    label: 'OrderItem',
    prefix: 'OR-IT',
  },
  RETURN_ORDER: {
    name: 'return order',
    label: 'ReturnOrder',
    prefix: 'RO',
  },
  RETURN_ORDER_ITEM: {
    name: 'return order item',
    label: 'ReturnOrderItem',
    prefix: 'RO-IT',
  },

  // Billing Revenue management
  INVOICE: {
    name: 'invoice',
    label: 'Invoice',
    prefix: 'INV',
  },
  INVOICE_ITEM: {
    name: 'invoice item',
    label: 'InvoiceItem',
    prefix: 'INV-IT',
  },
  PAYMENT_METHOD: {
    name: 'payment method',
    label: 'PaymentMethod',
    prefix: 'PMD',
  },
  TRANSACTION: {
    name: 'transaction',
    label: 'Transaction',
    prefix: 'TN',
  },

  // Field Service Module
  WORK_ORDER: {
    name: 'work order',
    label: 'WorkOrder',
    prefix: 'WO',
  },
  SERVICE_APPOINTMENT: {
    name: 'service appointment',
    label: 'ServiceAppointment',
    prefix: 'SA',
  },

  // Support Module
  NOTE: {
    name: 'note',
    label: 'Note',
    prefix: 'NT',
  },

  // Service Module
  NETWORK_DEVICE: {
    name: 'network device',
    label: 'NetworkDevice',
    prefix: 'ND',
  },
  CUSTOMER_DEVICE_ROUTER: {
    name: 'customer device router',
    label: 'CustomerDeviceRouter',
    prefix: 'CD-RT',
  },
  CUSTOMER_DEVICE_ONT: {
    name: 'customer device ont',
    label: 'CustomerDeviceOnt',
    prefix: 'CD-ONT',
  },
  SERVICE: {
    name: 'service',
    label: 'Service',
    prefix: 'SVC',
  },

  // Project Module
  PROGRAM: {
    name: 'program',
    label: 'Program',
    prefix: 'PRG',
  },
  PROJECT: {
    name: 'project',
    label: 'Project',
    prefix: 'PRO',
  },
  MILESTONE: {
    name: 'milestone',
    label: 'Milestone',
    prefix: 'MIL',
  },
  TASK: {
    name: 'task',
    label: 'Task',
    prefix: 'TSK',
  },
  SUBTASK: {
    name: 'subtask',
    label: 'Subtask',
    prefix: 'SBTSK',
  },
  FILE: {
    name: 'file',
    label: 'File',
    prefix: 'F',
  },

};

/**
 * Array of keys to validate @IsIn() enum class validator
 */
export const SCHEMA_MODULE_ENTITY_TYPE_KEYS = Object.keys(SchemaModuleEntityTypes);


/**
 * Get the module entity name using the key
 * @param key
 */
export const getSchemaModuleEntityName = (key: string): string | void => {
  const entity = SchemaModuleEntityTypes[key];
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
export const getSchemaModuleEntityLabel = (key: string): string | void => {
  const entity = SchemaModuleEntityTypes[key];
  if(entity) {
    return entity.label
  } else {
    return undefined;
  }
};
