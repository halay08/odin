export const formFields = [
  { label: 'Name', property: 'name', type: 'TEXT', isRequired: true, message: 'Please input name', value: undefined },
  {
    label: 'Description',
    property: 'description',
    type: 'TEXT',
    isRequired: true,
    message: 'Please input description',
    value: undefined,
  },
  {
    label: 'Key',
    property: 'key',
    type: 'TEXT',
    isRequired: true,
    message: 'Please input key',
    value: undefined,
    customValidation: true,
    customValidationCondition: 4,
    customValidationMessage: 'Key must be longer than or equal to 4 characters',
  },
  // {
  //   label: 'Position',
  //   property: 'position',
  //   type: 'NUMBER',
  //   isRequired: true,
  //   message: 'Please input position',
  //   value: undefined,
  // },
  {
    label: 'Is Default',
    property: 'isDefault',
    type: 'CHECKBOX',
    isRequired: false,
    message: 'Please check',
    value: false,
  },
  {
    label: 'Is Success',
    property: 'isSuccess',
    type: 'CHECKBOX',
    isRequired: false,
    message: 'Please check',
    value: false,
  },
  { label: 'Is Fail', property: 'isFail', type: 'CHECKBOX', isRequired: false, message: 'Please check', value: false },
]