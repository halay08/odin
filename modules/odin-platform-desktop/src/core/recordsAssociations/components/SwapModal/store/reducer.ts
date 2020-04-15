
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import {
  CLOSE_SWAP_MODAL,
  INITIALIZE_SWAP_MODAL
} from './constants';

export interface SwapModalReducer {
  showSwapModalList: { [recordId: string]: boolean },
  record: DbRecordEntityTransform | undefined,
  relation: DbRecordAssociationRecordsTransform | undefined,
  relatedRecord: DbRecordEntityTransform | undefined,
}


export const initialState: SwapModalReducer = {
  showSwapModalList: {},
  record: undefined,
  relation: undefined,
  relatedRecord: undefined
};

function reducer(state = initialState, action: any) {

  switch (action.type) {

    case INITIALIZE_SWAP_MODAL: {
      return {
        ...initialState,
        ...action.params,
        showSwapModalList: { ...state.showSwapModalList, [action.params.record.id]: action.params[action.params.record.id] }
      }
    }

    case CLOSE_SWAP_MODAL: {
      return {
        ...initialState
      }
    }

    default:
      return state;
  }
}

export default reducer;

