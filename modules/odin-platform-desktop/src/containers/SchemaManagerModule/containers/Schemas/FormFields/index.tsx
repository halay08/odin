export const formFields = [
  {
    label: 'Name',
    property: 'name',
    type: 'TEXT',
    isRequired: true,
    message: 'Please input name',
    value: undefined,
  },
  {
    label: 'Description',
    property: 'description',
    type: 'TEXT',
    isRequired: true,
    message: 'Please input description',
    value: undefined,
  },
  {
    label: 'Module Name',
    property: 'moduleName',
    type: 'ENUM',
    isRequired: false,
    message: 'Please input module name',
    isHidden: false,
    value: undefined,
    isDisabled: false,
    options: [
      { value: 'FieldServiceModule', label: 'field service module' },
      { value: 'CrmModule', label: 'crm module' },
      { value: 'OrderModule', label: 'order module' },
      { value: 'ProductModule', label: 'product module' },
      { value: 'ProjectModule', label: 'project module' },
      { value: 'BillingModule', label: 'billing module' },
      { value: 'NotificationModule', label: 'notification module' },
      { value: 'NoteModule', label: 'note module' },
      { value: 'ServiceModule', label: 'service module' },
    ],
  },
  {
    label: 'Entity Name',
    property: 'entityName',
    type: 'TEXT',
    isRequired: false,
    message: 'Please input entity name',
    isHidden: false,
    value: undefined,
    isDisabled: false,
  },
]
