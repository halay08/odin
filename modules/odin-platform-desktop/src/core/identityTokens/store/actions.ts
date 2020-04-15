import { 
  CREATE_TOKEN_REQUEST,
  DELETE_TOKEN_REQUEST, 
  GET_TOKENS_DATA_REQUEST, 
  GET_TOKEN_BY_ID_REQUEST} from "./constants";

export interface DeleteToken {
  tokenId: string
}

export interface CreateNewToken {
  body: {
    name: string,
    description: string
  }
}


export function getTokensDataRequest() {
  return {
    type: GET_TOKENS_DATA_REQUEST
  };
}


export function getTokenByIdRequest(params: any, cb = () => {
}) {
  return {
    type: GET_TOKEN_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deleteTokenRequest(params: DeleteToken, cb = () => {
}) {
  return {
    type: DELETE_TOKEN_REQUEST,
    params,
    cb,
  }
}

export function createTokenRequest(params: CreateNewToken, cb = () => {
}) {
  return {
    type: CREATE_TOKEN_REQUEST,
    params,
    cb,
  }
}

