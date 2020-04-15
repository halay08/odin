import {all} from 'redux-saga/effects';
import userLoginSaga from '../core/identity/store/sagas';
import premiseSaga from '../containers/CrmModule/containers/Premise/store/sagas';
import schemaSaga from '../core/schemas/store/sagas';
import dbRecordSaga from '../core/records/store/sagas';
import dbRecordAssociationsSaga from '../core/recordsAssociations/store/sagas';
import auditLogsSaga from '../core/records/auditLogs/store/sagas';
import pipelineSaga from '../core/pipelines/store/sagas';
import reportSaga from '../core/reporting/store/sagas';
import emailNotificationSaga from '../core/notifications/email/store/sagas';
import appointmentSaga from '../core/appointments/store/sagas';
import serviceSaga from '../core/service/store/sagas';
import schemasColumnSaga from "../core/schemasColumns/store/sagas";
import schemasAssociationsSaga from "../core/schemasAssociations/store/sagas";
import identityUserSaga from "../core/identityUser/store/sagas";
import identityRbacRolesSaga from "../core/identityRoles/store/sagas";
import identityGroups from "../core/identityGroups/store/sagas";
import identityRbacPermission from "../core/identityPermissions/store/sagas";
import identityTokens from "../core/identityTokens/store/sagas";
import identityConnectedApps from "../core/identityConnectedApps/store/sagas";
import workflowSaga from "../core/workflow/store/sagas";

export default function* rootSaga() {
    yield all([
        userLoginSaga(),
        premiseSaga(),
        schemaSaga(),
        schemasColumnSaga(),
        schemasAssociationsSaga(),
        dbRecordSaga(),
        dbRecordAssociationsSaga(),
        pipelineSaga(),
        auditLogsSaga(),
        reportSaga(),
        emailNotificationSaga(),
        appointmentSaga(),
        serviceSaga(),
        identityUserSaga(),
        identityRbacRolesSaga(),
        identityGroups(),
        identityRbacPermission(),
        identityTokens(),
        identityConnectedApps(),
        workflowSaga()
    ]);
}

