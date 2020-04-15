import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Premise } from '../types/premise.interface';
import {
  GET_PREMISE_BY_UDPRN_AND_UMPRN_REQUEST,
  LOG_PREMISE_VISIT_REQUEST,
  PREMISE_LIST_CANCEL_REQUESTS,
  SET_SELECTED_PREMISE,
  UPDATE_PREMISES_SALES_STATUS_REQUEST,
} from './constants';
import { OpsPremiseCreateUpdate } from './reducer';

export function getPremiseByUdprnAndUmprnRequest(params: { udprn: string, umprn: string }, cb = () => {
}) {
  return {
    type: GET_PREMISE_BY_UDPRN_AND_UMPRN_REQUEST,
    params,
    cb,
  }
}

export function logPremiseVisitRequest(
  params: { schema: SchemaEntity, createUpdate: DbRecordCreateUpdateDto },
  cb = () => {
  },
) {
  return {
    type: LOG_PREMISE_VISIT_REQUEST,
    params,
    cb,
  }
}

export function updatePremiseSalesStatusRequest(
  params: { createUpdate: OpsPremiseCreateUpdate[] },
  cb = () => {
  },
) {
  return {
    type: UPDATE_PREMISES_SALES_STATUS_REQUEST,
    params,
    cb,
  }
}

export function setSelectedPremise(selected: Premise) {
  return {
    type: SET_SELECTED_PREMISE,
    selected,
  }
}

export function premiseListCancelRequests() {
  return {
    type: PREMISE_LIST_CANCEL_REQUESTS,
  }
}


