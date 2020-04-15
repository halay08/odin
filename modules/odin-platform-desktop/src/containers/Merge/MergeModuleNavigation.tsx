import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import MergeRecords from './index';


export const MergeModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path="/merge/:moduleName/:entityName"
      moduleName={'OVERIDE'}
      component={
        <MergeRecords/>
      }/>
  </Switch>
}
