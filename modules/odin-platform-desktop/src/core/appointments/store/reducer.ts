import { SchemaEntity } from "@d19n/models/dist/schema-manager/schema/schema.entity";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { PipelineEntity } from "@d19n/models/dist/schema-manager/pipeline/pipeline.entity";
import {
  CANCEL_APPOINTMENT_RECORD_ERROR,
  CANCEL_APPOINTMENT_RECORD_SUCCESS,
  CLOSE_CANCEL_APPOINTMENT_MODAL,
  CREATE_APPOINTMENT_ERROR,
  CREATE_APPOINTMENT_REQUEST,
  CREATE_APPOINTMENT_SUCCESS,
  INITIALIZE_CANCEL_APPOINTMENT_MODAL,
  LOAD_AVAILABLE_APPOINTMENTS_ERROR,
  LOAD_AVAILABLE_APPOINTMENTS_REQUEST,
  LOAD_AVAILABLE_APPOINTMENTS_SUCCESS,
} from "./constants";
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";

export interface ServiceAppointmentCreateDto {
  Date: string | null,
  TimeBlock: 'AM' | 'PM' | null
}

export interface IAppointmentReducer {
  isRequesting: boolean,
  isCreating: boolean,
  isUpdating: boolean,
  isSearching: boolean,
  cancelModalVisible: boolean,
  cancelRelatedRecord: DbRecordEntityTransform | undefined,
  schema: SchemaEntity | null,
  list: PipelineEntity[],
  shortList: { [key: string]: any } | null,
  selected: { [key: string]: any } | null,
  createUpdate: ServiceAppointmentCreateDto
  errors: ExceptionType[]
}


export const initialState: IAppointmentReducer = {
  isRequesting: false,
  isCreating: false,
  isUpdating: false,
  isSearching: false,
  cancelModalVisible: false,
  cancelRelatedRecord: undefined,
  schema: null,
  selected: null,
  list: [],
  shortList: {},
  createUpdate: {
    Date: null,
    TimeBlock: null,
  },
  errors: [],
};

function reducer(state = initialState, action: any) {
  switch (action.type) {
    case LOAD_AVAILABLE_APPOINTMENTS_REQUEST: {
      return {
        ...state,
        isSearching: true,
      }
    }
    case LOAD_AVAILABLE_APPOINTMENTS_SUCCESS: {
      return {
        ...state,
        isSearching: false,
        list: action.results.data,
      }
    }
    case LOAD_AVAILABLE_APPOINTMENTS_ERROR: {
      return {
        ...state,
        isSearching: false,
      }
    }

    case CREATE_APPOINTMENT_REQUEST: {
      return {
        ...state,
        isCreating: true,
      }
    }
    case CREATE_APPOINTMENT_SUCCESS: {
      return {
        ...state,
        isCreating: false,
      }
    }
    case CREATE_APPOINTMENT_ERROR: {
      return {
        ...state,
        isCreating: false,
      }
    }

    case INITIALIZE_CANCEL_APPOINTMENT_MODAL: {
      return {
        ...state,
        ...action.params,
      }
    }

    case CANCEL_APPOINTMENT_RECORD_SUCCESS: {
      return {
        ...state,
        cancelModalVisible: false,
        cancelRelatedRecord: undefined,
      }
    }

    case CANCEL_APPOINTMENT_RECORD_ERROR: {
      return {
        ...state,
        cancelModalVisible: false,
        cancelRelatedRecord: undefined,
      }
    }

    case CLOSE_CANCEL_APPOINTMENT_MODAL: {
      return {
        ...state,
        cancelModalVisible: false,
        cancelRelatedRecord: undefined,
      }
    }

    default:
      return state;
  }
}

export default reducer;
