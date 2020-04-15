export interface Service {
    name: string;
    prefix: string;
    description?: string;
    hostname: string;
    port: number;
}

/**
 * All Modules available in the Odin network
 */
export enum SERVICE_NAME {
    IDENTITY_MODULE = 'IdentityModule',
    CRM_MODULE = 'CrmModule',
    ORDER_MODULE = 'OrderModule',
    FIELD_SERVICE_MODULE = 'FieldServiceModule',
    PRODUCT_MODULE = 'ProductModule',
    BILLING_MODULE = 'BillingModule',
    NOTIFICATION_MODULE = 'NotificationModule',
    SUPPORT_MODULE = 'SupportModule',
    SCHEMA_MODULE = 'SchemaModule',
    CONNECT_MODULE = 'ConnectModule',
    SEARCH_MODULE = 'SearchModule',
    SETTING_MODULE = 'SettingModule',
    AUDIT_MODULE = 'AuditModule',
    SERVICE_MODULE = 'ServiceModule',
    PROJECT_MODULE = 'ProjectModule',
}

export const SERVICES: { [name: string]: Service } = {
    IdentityModule: {
        name: 'identity module',
        prefix: 'IdentityModule',
        hostname: 'odin-api-identity',
        port: 10100,
    },
    SchemaModule: {
        name: 'Schema module',
        prefix: 'SchemaModule',
        hostname: 'odin-api-schema-manager',
        port: 10105,
    },
    CrmModule: {
        name: 'crm module',
        prefix: 'CrmModule',
        hostname: 'odin-api-crm',
        port: 10104,
    },
    AuditModule: {
        name: 'audit module',
        prefix: 'AuditModule',
        hostname: 'odin-api-logging',
        port: 10108,
    },
    OrderModule: {
        name: 'order module',
        prefix: 'OrderModule',
        hostname: 'odin-api-orders',
        port: 10109,
    },
    ProductModule: {
        name: 'product catalog module',
        prefix: 'ProductModule',
        hostname: 'odin-api-product-catalog',
        port: 10110,
    },
    ConnectModule: {
        name: 'connect module',
        prefix: 'ConnectModule',
        hostname: 'odin-api-connect',
        port: 10111,
    },
    BillingModule: {
        name: 'billing module',
        prefix: 'BillingModule',
        hostname: 'odin-api-billing',
        port: 10112,
    },
    NotificationModule: {
        name: 'notification module',
        prefix: 'NotificationModule',
        hostname: 'odin-api-notifications',
        port: 10113,
    },
    SearchModule: {
        name: 'search module',
        prefix: 'SearchModule',
        hostname: 'odin-api-search',
        port: 10114,
    },
    SupportModule: {
        name: 'note module',
        prefix: 'SupportModule',
        hostname: 'odin-api-notes',
        port: 10115,
    },
    SettingModule: {
        name: 'setting module',
        prefix: 'SettingModule',
        hostname: 'odin-api-settings',
        port: 10116,
    },
    FieldServiceModule: {
        name: 'field service module',
        prefix: 'FieldServiceModule',
        hostname: 'odin-api-field-service',
        port: 10117,
    },
    ServiceModule: {
        name: 'service module',
        prefix: 'ServiceModule',
        hostname: 'odin-api-service',
        port: 10118,
    },
    ProjectModule: {
        name: 'project module',
        prefix: 'ProjectModule',
        hostname: 'odin-api-projects',
        port: 10119,
    },
    QGISConnectionModule: {
        name: 'qgis connection module',
        prefix: 'QGISConnectionModule',
        hostname: 'odin-api-qgis-connections',
        port: 10120,
    },

};
