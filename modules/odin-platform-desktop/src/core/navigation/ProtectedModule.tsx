import React from 'react'
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { canUserAccessModule } from '../../shared/permissions/rbacRules';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  moduleName: string,
  exact?: boolean,
  userReducer: any,
  component: React.ReactNode
}

const ProtectedModule = ({ moduleName, userReducer, component, ...rest }: PropsType) => {

  const canAccess = moduleName === 'OVERIDE' ? true : canUserAccessModule(userReducer, moduleName);

  return canAccess ? (
    <>
      {component}
    </>
  ) : (
    <></>
  );
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
});

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(ProtectedModule));


