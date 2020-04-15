import {combineReducers} from 'redux';
import mapReducer from '../core/gis/store/reducer';
import userReducer from '../core/identity/store/reducers';
import notificationReducer from '../shared/system/notifications/store/reducers';
import messageReducer from '../shared/system/messages/store/reducers';
import premiseReducer from '../containers/CrmModule/containers/Premise/store/reducer';
import schemaReducer from '../core/schemas/store/reducer';
import recordReducer from '../core/records/store/reducer';
import recordFormReducer from '../core/records/components/Forms/store/reducer';
import recordAssociationReducer from '../core/recordsAssociations/store/reducer';
import pipelineReducer from '../core/pipelines/store/reducer';
import auditLogsReducer from '../core/records/auditLogs/store/reducer';
import reportReducer from '../core/reporting/store/reducer';
import recordTableReducer from '../core/records/components/DynamicTable/store/reducer';
import emailNotificationReducer from '../core/notifications/email/store/reducer';
import appointmentReducer from '../core/appointments/store/reducer';
import serviceReducer from '../core/service/store/reducer';
import queryBuilderReducer
    from '../core/records/components/DynamicTable/QueryBuilder/store/reducer';
import navigationReducer from '../core/navigation/store/reducer';
import {USER_LOGOUT_REQUEST} from "../core/identity/store/constants";
import formReducer from "../shared/components/FormModal/store/reducer";
import stepViewReducer from "../shared/components/StepView/store/reducer";
import schemaColumnReducer from "../core/schemasColumns/store/reducer";
import schemaAssociationReducer from "../core/schemasAssociations/store/reducer";
import identityUserReducer from "../core/identityUser/store/reducer";
import identityRbacRoleReducer from "../core/identityRoles/store/reducer";
import identityGroupsReducer from "../core/identityGroups/store/reducer";
import identityRbacPermissionReducer from "../core/identityPermissions/store/reducer";
import identityTokensReducer from "../core/identityTokens/store/reducer";
import identityConnectedAppsReducer from "../core/identityConnectedApps/store/reducer";
import swapModalReducer from "../core/recordsAssociations/components/SwapModal/store/reducer";
import workflowReducer from "../core/workflow/store/reducer"


const rootReducer = combineReducers({
    userReducer,
    notificationReducer,
    messageReducer,
    premiseReducer,
    schemaReducer,
    schemaColumnReducer,
    schemaAssociationReducer,
    recordReducer,
    recordFormReducer,
    recordAssociationReducer,
    pipelineReducer,
    auditLogsReducer,
    reportReducer,
    recordTableReducer,
    emailNotificationReducer,
    appointmentReducer,
    queryBuilderReducer,
    navigationReducer,
    formReducer,
    stepViewReducer,
    serviceReducer,
    mapReducer,
    identityUserReducer,
    identityRbacRoleReducer,
    identityGroupsReducer,
    identityRbacPermissionReducer,
    identityTokensReducer,
    identityConnectedAppsReducer,
    swapModalReducer,
    workflowReducer
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
