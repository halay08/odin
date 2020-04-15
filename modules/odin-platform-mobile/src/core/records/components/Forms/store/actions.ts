import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import {
  ADD_ASSOCIATION_TO_FORM_SECTION,
  CLOSE_FORM_MODAL,
  INITIALIZE_FORM,
  REMOVE_ASSOCIATION_FROM_FORM_SECTION,
  UPDATE_FORM_INPUT,
  UPDATE_FORM_STATE,
} from './constants';

export function initializeRecordForm(params: any) {
  return {
    type: INITIALIZE_FORM,
    params,
  }
}

export function updateRecordFormState(params: any) {
  return {
    type: UPDATE_FORM_STATE,
    params,
  }
}

export function closeRecordForm() {
  return {
    type: CLOSE_FORM_MODAL,
  }
}

export function updateFormInput(params: { targetId: string, targetValue: any, record: DbRecordEntityTransform, association: DbRecordAssociationCreateUpdateDto }) {
  return {
    type: UPDATE_FORM_INPUT,
    params,
  }
}

export function addAssociationToFormSection(params: { targetId: string, association: DbRecordAssociationCreateUpdateDto }) {
  return {
    type: ADD_ASSOCIATION_TO_FORM_SECTION,
    params,
  }
}

export function removeAssociationFromSection(params: { targetId: string, association: DbRecordAssociationCreateUpdateDto }) {
  return {
    type: REMOVE_ASSOCIATION_FROM_FORM_SECTION,
    params,
  }
}

export function addFormField() {
  return {}
}

export function removeFormField() {
  return {}
}
