import {
  DELETE_SIPWISE_CUSTOMER_CONTACT_ERROR,
  DELETE_SIPWISE_CUSTOMER_CONTACT_REQUEST,
  DELETE_SIPWISE_CUSTOMER_CONTACT_SUCCESS,
  DELETE_SIPWISE_CUSTOMER_ERROR,
  DELETE_SIPWISE_CUSTOMER_REQUEST,
  DELETE_SIPWISE_CUSTOMER_SUCCESS,
  DELETE_SIPWISE_SUBSCRIBER_ERROR,
  DELETE_SIPWISE_SUBSCRIBER_REQUEST,
  DELETE_SIPWISE_SUBSCRIBER_SUCCESS,
  GET_SIPWISE_FULL_PROFILE_ERROR,
  GET_SIPWISE_FULL_PROFILE_REQUEST,
  GET_SIPWISE_FULL_PROFILE_SUCCESS,
} from './constants';


export interface IServiceReducer {
  isRequesting: boolean,
  isCreating: boolean,
  isDeleting: boolean,
  isUpdating: boolean,
  isSearching: boolean,
  list: { [recordId: string]: any },
  errors: [],
}


export const initialState: IServiceReducer = {
  isRequesting: false,
  isCreating: false,
  isDeleting: false,
  isUpdating: false,
  isSearching: false,
  list: {},
  errors: [],
};

function reducer(state = initialState, action: any) {
  switch (action.type) {

    case GET_SIPWISE_FULL_PROFILE_REQUEST: {
      return {
        ...state,
        isRequesting: true,
      }
    }
    case GET_SIPWISE_FULL_PROFILE_SUCCESS: {
      return {
        ...state,
        list: { ...state.list, [action.results.recordId]: action.results.data },
        isRequesting: false,
      }
    }
    case GET_SIPWISE_FULL_PROFILE_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    case DELETE_SIPWISE_SUBSCRIBER_REQUEST: {
      return {
        ...state,
        isDeleting: true,
      }
    }

    case DELETE_SIPWISE_SUBSCRIBER_SUCCESS: {
      return {
        ...state,
        isDeleting: false,
      }
    }

    case DELETE_SIPWISE_SUBSCRIBER_ERROR: {
      return {
        ...state,
        isDeleting: false,
      }
    }

    case DELETE_SIPWISE_CUSTOMER_REQUEST: {
      return {
        ...state,
        isDeleting: true,
      }
    }

    case DELETE_SIPWISE_CUSTOMER_SUCCESS: {
      return {
        ...state,
        isDeleting: false,
      }
    }

    case DELETE_SIPWISE_CUSTOMER_ERROR: {
      return {
        ...state,
        isDeleting: false,
      }
    }

    case DELETE_SIPWISE_CUSTOMER_CONTACT_REQUEST: {
      return {
        ...state,
        isDeleting: true,
      }
    }

    case DELETE_SIPWISE_CUSTOMER_CONTACT_SUCCESS: {
      return {
        ...state,
        isDeleting: false,
      }
    }

    case DELETE_SIPWISE_CUSTOMER_CONTACT_ERROR: {
      return {
        ...state,
        isDeleting: false,
      }
    }

    default:
      return state;
  }
}

export default reducer;
