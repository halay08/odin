import { CLOSE_SHARED_FORM_MODAL, INITIALIZE_SHARED_FORM, UPDATE_SHARED_FORM_INPUT } from './constants';

// Actions
export function initializeSharedForm(params: any) {
  return {
    type: INITIALIZE_SHARED_FORM,
    params,
  }
}

export function closeSharedForm() {
  return {
    type: CLOSE_SHARED_FORM_MODAL,
  }
}

export function updateSharedFormInput(params: any) {
  return {
    type: UPDATE_SHARED_FORM_INPUT,
    params,
  }
}
