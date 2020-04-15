import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type';

const dropdownSet = () => {
  let tempArr: any = [];
  for(var n in ORGANIZATION_USER_RBAC_PERMISSION_TYPE) {
    tempArr.push({ value: n, label: n })
  }
  return tempArr;
}

export const formFields = [
  {
    label: '',
    property: 'id',
    type: 'TEXT',
    isRequired: true,
    message: '',
    isHidden: true,
    value: undefined,
  },
  {
    label: 'Name',
    property: 'name',
    type: 'TEXT',
    isRequired: true,
    message: 'Please input Name',
    isHidden: false,
    value: undefined,
  },
  {
    label: 'Description',
    property: 'description',
    type: 'TEXT',
    isRequired: true,
    message: 'Please input Description',
    isHidden: false,
    value: undefined,
  },
  {
    label: 'Type',
    property: 'type',
    type: 'ENUM',
    isRequired: true,
    message: 'Please select',
    isHidden: false,
    value: undefined,
    options: dropdownSet(),
  },
]
