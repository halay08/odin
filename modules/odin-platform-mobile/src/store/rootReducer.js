import {combineReducers} from 'redux';
import notificationReducer from '../shared/system/notifications/store/reducers';
import messageReducer from '../shared/system/messages/store/reducers';
import premiseReducer from '../containers/CrmModule/containers/Premise/store/reducer';
import schemaReducer from '../core/schemas/store/reducer';
import recordReducer from '../core/records/store/reducer';
import recordFormReducer from '../core/records/components/Forms/store/reducer';
import recordAssociationReducer from '../core/recordsAssociations/store/reducer';
import pipelineReducer from '../core/records/components/Pipeline/store/reducer';
import recordTableReducer from '../core/records/components/DynamicTable/store/reducer';
import stepViewReducer from "../shared/components/StepView/store/reducer";
import identityReducer from "../core/identity/store/reducers";
import userReducer from "../core/identity/store/reducers";
import navigationReducer from "../core/navigation/store/reducer"
import {USER_LOGOUT_REQUEST} from "../core/identity/store/constants";


const rootReducer = combineReducers({
    identityReducer,
    userReducer,
    stepViewReducer,
    notificationReducer,
    messageReducer,
    premiseReducer,
    schemaReducer,
    recordReducer,
    recordFormReducer,
    recordAssociationReducer,
    pipelineReducer,
    recordTableReducer,
    navigationReducer
});


// Handle cleanup / reset persisted state on logout
const appReducer = (state, action) => {

    let newState = state;

    if (action.type === USER_LOGOUT_REQUEST) {

        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('timestamp');
        localStorage.removeItem(`${process.env.REACT_APP_ODIN_REDUX_STORE_NAME}`);
        newState = undefined;
        newState = {
            navigationReducer: state.navigationReducer
        }

    }
    return rootReducer(newState, action);
};

export default appReducer;
