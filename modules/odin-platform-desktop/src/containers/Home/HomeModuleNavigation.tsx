import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import Home from './Home';


export const HomeModuleRoutes = () => {

  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);
 
  return <Switch>
    <ProtectedRoute path="/" moduleName={'OVERIDE'} exact component={<Home/>}/>
  </Switch>
}
