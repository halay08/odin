import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import {
  GET_PREMISE_BY_UDPRN_AND_UMPRN_ERROR,
  GET_PREMISE_BY_UDPRN_AND_UMPRN_REQUEST,
  GET_PREMISE_BY_UDPRN_AND_UMPRN_SUCCESS,
  LOG_PREMISE_VISIT_ERROR,
  LOG_PREMISE_VISIT_REQUEST,
  LOG_PREMISE_VISIT_SUCCESS,
  PREMISE_LIST_CANCEL_REQUESTS,
  SET_SELECTED_PREMISE,
  UPDATE_PREMISES_SALES_STATUS_ERROR,
  UPDATE_PREMISES_SALES_STATUS_REQUEST,
  UPDATE_PREMISES_SALES_STATUS_SUCCESS,
} from './constants';


export interface OpsPremiseCreateUpdate {
  udprn: string;
  umprn: string;
  statusId: number;
}

export interface PremiseReducerState {
  isRequesting: boolean,
  isCreating: boolean,
  udprn: string | null,
  umprn: string | null,
  selected: DbRecordEntityTransform | null,
  visit: any,
}


export const initialState: PremiseReducerState = {
  isRequesting: false,
  isCreating: false,
  udprn: null,
  umprn: null,
  visit: null,
  selected: null,
};

function reducer(state = initialState, action: any) {
  switch (action.type) {

    case GET_PREMISE_BY_UDPRN_AND_UMPRN_REQUEST: {
      return {
        ...state,
        ...action.params,
      }
    }
    case GET_PREMISE_BY_UDPRN_AND_UMPRN_SUCCESS: {
      return {
        ...state,
        selected: { ...state.selected, ...action.results },
      }
    }
    case GET_PREMISE_BY_UDPRN_AND_UMPRN_ERROR: {
      return {
        ...state,
        isRequesting: false,
        selected: null,
      }
    }

    case UPDATE_PREMISES_SALES_STATUS_REQUEST: {
      return {
        ...state,
        ...action.body,
      }
    }
    case UPDATE_PREMISES_SALES_STATUS_SUCCESS: {
      return {
        ...state,
      }
    }
    case UPDATE_PREMISES_SALES_STATUS_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    case LOG_PREMISE_VISIT_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        visit: action.visit,
      }
    }
    case LOG_PREMISE_VISIT_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        visit: {},
      }
    }
    case LOG_PREMISE_VISIT_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }


    case SET_SELECTED_PREMISE: {
      return {
        ...state,
        selected: { ...state.selected, ...action.selected },
        isRequesting: false,
      }
    }

    case PREMISE_LIST_CANCEL_REQUESTS: {
      return {
        ...state,
        isRequesting: false,
      }
    }
    default:
      return state;
  }
}

export default reducer;

