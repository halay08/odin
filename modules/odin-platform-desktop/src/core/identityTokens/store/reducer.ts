import { OrganizationUserTokenEntity } from "@d19n/models/dist/identity/organization/user/token/organization.user.token.entity";
import { 
  GET_TOKENS_DATA_ERROR, 
  GET_TOKENS_DATA_REQUEST, 
  GET_TOKENS_DATA_SUCCESS, 
  GET_TOKEN_BY_ID_ERROR, 
  GET_TOKEN_BY_ID_REQUEST, 
  GET_TOKEN_BY_ID_SUCCESS} from "./constants";


export interface IdentityTokensReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  list: OrganizationUserTokenEntity[],
  shortList: {
    [key: string]: OrganizationUserTokenEntity
  }  
}

export const initialState: IdentityTokensReducer = {
  isRequesting: false,
  isSuccessful: false,
  list: [],
  shortList: {}
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all tokens
    case GET_TOKENS_DATA_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_TOKENS_DATA_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_TOKENS_DATA_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    // Get a single token by id
    case GET_TOKEN_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false
      }
    }
    case GET_TOKEN_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_TOKEN_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    default:
      return state;
  }
}

export default reducer;

