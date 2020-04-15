import { OrganizationAppEntity } from "@d19n/models/dist/identity/organization/app/organization.app.entity";
import { 
  EDIT_CONNECTED_APP_SUCCESS,
  GET_CONNECTED_APPS_DATA_ERROR, 
  GET_CONNECTED_APPS_DATA_REQUEST, 
  GET_CONNECTED_APPS_DATA_SUCCESS, 
  GET_CONNECTED_APP_BY_ID_ERROR, 
  GET_CONNECTED_APP_BY_ID_REQUEST, 
  GET_CONNECTED_APP_BY_ID_SUCCESS} from "./constants";


export interface IdentityConnectedAppsReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  list: OrganizationAppEntity[],
  shortList: {
    [key: string]: OrganizationAppEntity
  }  
}

export const initialState: IdentityConnectedAppsReducer = {
  isRequesting: false,
  isSuccessful: false,
  list: [],
  shortList: {}
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all connected apps
    case GET_CONNECTED_APPS_DATA_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_CONNECTED_APPS_DATA_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_CONNECTED_APPS_DATA_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    // Get a single connected app by id
    case GET_CONNECTED_APP_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false
      }
    }
    case GET_CONNECTED_APP_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_CONNECTED_APP_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case EDIT_CONNECTED_APP_SUCCESS: {
      return {
        ...state,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }

    default:
      return state;
  }
}

export default reducer;

