import {all} from 'redux-saga/effects';
import userLoginSaga from '../core/identity/store/sagas';
import premiseSaga from '../containers/CrmModule/containers/Premise/store/sagas';
import schemaSaga from '../core/schemas/store/sagas';
import dbRecordSaga from '../core/records/store/sagas';
import dbRecordAssociationsSaga from '../core/recordsAssociations/store/sagas';
import pipelineSaga from '../core/records/components/Pipeline/store/sagas';


export default function* rootSaga() {
    yield all([
        userLoginSaga(),
        premiseSaga(),
        schemaSaga(),
        dbRecordSaga(),
        dbRecordAssociationsSaga(),
        pipelineSaga()
    ])
    // code after all-effect
}

