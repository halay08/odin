import React, {useEffect} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {addPathToHistory} from "./store/actions";
import {isUserAuthenticated} from "../../shared/permissions/rbacRules";


type PathParams = {
  url: string,
  recordId: string
}
type PropsType = RouteComponentProps<PathParams> & {
  userReducer: any,
  navigationReducer: any,
  history: any,
  addPathToHistory: any
}


const Helmet = (props: PropsType) => {

  const {addPathToHistory, navigationReducer, history, userReducer} = props
  const currentPath = props.history.location.pathname

  const handlePathChange = () => {
    if(!isUserAuthenticated(userReducer) && !navigationReducer.previousPage){
      console.log('%c User not authenticated / No previousPage', 'color:red')
      history.push('/login')
    }
    else if(isUserAuthenticated(userReducer) && !navigationReducer.previousPage){
      console.log('%c User is authenticated / No previousPage', 'color:orange')
      addPathToHistory({path: '/'})
    }
    /* New path -> Add */
    else if(navigationReducer.previousPage && navigationReducer.previousPage !== currentPath){
      console.log('%c User is authenticated / Previous page is different, adding new.', 'color:limegreen', currentPath)
      addPathToHistory({path: currentPath})
    }
  }

  useEffect(() => {
    handlePathChange()
  }, [currentPath]);

  return (
    <></>
  )
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  navigationReducer: state.navigationReducer
});

const mapDispatch = (dispatch: any) => ({
  addPathToHistory: (params: { path: string, title: string }) => dispatch(addPathToHistory(params)),
});


export default withRouter(connect(mapState, mapDispatch)(Helmet));
