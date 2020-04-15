import React from 'react'
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom'
import { isUserAuthenticated } from '../../shared/permissions/rbacRules';

interface Props {
  moduleName: string,
  exact?: boolean,
  path: string;
  userReducer: any,
  component: React.ReactNode
}

const ProtectedRoute = ({ moduleName, path, userReducer, component, ...rest }: Props) => {

  const isAuthenticated = isUserAuthenticated(userReducer);

  // TODO: We need to find a simple way to verify that the user can access the module and entity and action
  const canAccess = true;
  // const canAccess = moduleName === 'OVERIDE' ? true : canUserAccessModule(userReducer, moduleName);
  return (
    // the user can access the module and the routes
    /*isAuthenticated ?*/
    <Route {...rest} exact path={path} render={(props) => {

      if(canAccess) {
        return (
          component
        )
      } else {
        return (<Redirect to={{ pathname: '/403', state: { from: props.location } }}/>)
      }

    }}

    />
    /*:*/
    /*<Redirect to={{ pathname: '/login' }}/>*/
    /*<LoginModal visible={!isUserAuthenticated(userReducer)}/>*/

  )
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
});

const mapDispatch = (dispatch: any) => ({});

export default connect(mapState, mapDispatch)(ProtectedRoute);


