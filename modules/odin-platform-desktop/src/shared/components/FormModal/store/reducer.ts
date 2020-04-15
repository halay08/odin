import { updateObject } from '../../../utilities/reducerHelpers';
import { CLOSE_SHARED_FORM_MODAL, INITIALIZE_SHARED_FORM, UPDATE_SHARED_FORM_INPUT } from './constants';


export interface SharedFormReducer {
  showModal: boolean,
  formUUID: string,
  title: string,
  recordId?: string | number,
  formFields: any,
  saveData: any,
  entityName: string,
  isUpdateReq: boolean,
}

export const initialState: SharedFormReducer = {
  showModal: false,
  formUUID: '',
  title: 'Form',
  recordId: undefined,
  formFields: [],
  saveData: {},
  entityName: '',
  isUpdateReq: false,
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    case INITIALIZE_SHARED_FORM: {
      return {
        ...state,
        ...action.params,
      }
    }

    case CLOSE_SHARED_FORM_MODAL: {
      return {
        ...initialState,
      }
    }

    case UPDATE_SHARED_FORM_INPUT: {
      let formData = state.saveData;
      formData = updateObject(formData, { [action.params.property]: action.params.value })
      return {
        ...state,
        saveData: formData,
      }
    }

    default:
      return state;
  }
}

export default reducer;

