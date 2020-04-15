export const hasOrderAccess = (authUser?: any) => {
  console.log('hasOrderAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const hasFieldServiceAccess = (authUser?: any) => {
  console.log('hasFieldServiceAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};


export const hasCrmAccess = (authUser?: any) => {
  console.log('hasCrmAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};


export const hasSupportModuleAccess = (authUser?: any) => {
  console.log('hasCrmAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};


export const hasProductModuleAccess = (authUser?: any) => {
  console.log('hasCrmAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const hasModuleSelectorAccess = (authUser?: any) => {
  console.log('hasModuleSelectorAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const hasBillingModuleAccess = (authUser?: any) => {
  console.log('hasBillingModuleAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const hasServiceModuleAccess = (authUser?: any) => {
  console.log('hasServiceModuleAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const isAuthenticated = (authUser?: any) => {
  console.log('hasModuleSelectorAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const isAdmin = (authUser?: any) => {
  console.log('hasModuleSelectorAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return authUser.roles.includes('schemas.admin');
  }
  return false;
};

export const hasIdentityManageModuleAccess = (authUser?: any) => {
  console.log('hasIdentityManageModuleAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const hasSchemaManageModuleAccess = (authUser?: any) => {
  console.log('hasSchemaManageModuleAccess authUser', authUser);
  if(!!authUser && !!authUser.roles && authUser.roles.length > 0) {
    return true;
  }
  return false;
};

export const isBetaTester = (authUser?: any) => {
  return !!authUser.user.isBetaTester;
};

export default {
  hasCrmAccess,
  hasOrderAccess,
  hasFieldServiceAccess,
  hasModuleSelectorAccess,
  isAuthenticated,
  isAdmin,
  hasSupportModuleAccess,
  hasProductModuleAccess,
  hasBillingModuleAccess,
  hasServiceModuleAccess,
  hasIdentityManageModuleAccess,
  hasSchemaManageModuleAccess,
  isBetaTester,
}
