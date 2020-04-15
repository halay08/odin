import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import {
  CREATE_ORDER_MODAL_VISIBILE,
  SELECT_ORDER_TYPE_MODAL_VISIBILE,
  UPDATE_ORDER_WORKFLOW,
} from './constants';

const { ORDER } = SchemaModuleEntityTypeEnums;

export interface WorkflowReducer {
  [ORDER]: {
    isCreateOrderVisible: boolean,
    isSelectOrderTypeVisible: boolean,
    selectedProductItems: any,
    selectedBaseProductItems: any
  }
}


export const initialState: WorkflowReducer = {
  [ORDER]: {
    isCreateOrderVisible: false,
    isSelectOrderTypeVisible: false,
    selectedProductItems: [],
    selectedBaseProductItems: []
  }
};

function reducer(state = initialState, action: any) {
  switch (action.type) {

    case CREATE_ORDER_MODAL_VISIBILE: {
      return {
        ...state,
        [ORDER]: {
          ...state[ORDER],
          isCreateOrderVisible: !state[ORDER].isCreateOrderVisible
        }
      }
    }

    case SELECT_ORDER_TYPE_MODAL_VISIBILE: {
      return {
        [ORDER]: {
          ...state[ORDER],
          isSelectOrderTypeVisible: !state[ORDER].isSelectOrderTypeVisible
        }
      }
    }

    case UPDATE_ORDER_WORKFLOW: {
      return {
        [ORDER]: {
          ...state[ORDER],
          ...action.params
        }
      }
    }

    default:
      return state;
  }
}

export default reducer;

