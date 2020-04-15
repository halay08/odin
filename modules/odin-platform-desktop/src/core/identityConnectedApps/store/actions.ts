import { 
  CREATE_CONNECTED_APP_REQUEST,
  DELETE_CONNECTED_APP_REQUEST, 
  EDIT_CONNECTED_APP_REQUEST, 
  GET_CONNECTED_APPS_DATA_REQUEST, 
  GET_CONNECTED_APP_BY_ID_REQUEST} from "./constants";

export interface DeleteConnectedApp {
  connectedAppId: string
}

export interface CreateNewConnectedApp {
  body: {
    name: string,
    baseUrl: string,
    apiKey: string
  }
}

export interface EditConnectedApp {
  connectedAppId: string,
  body: {
    name: string,
    baseUrl: string,
    apiKey: string
  }
}


export function getConnectedAppsDataRequest() {
  return {
    type: GET_CONNECTED_APPS_DATA_REQUEST
  };
}


export function getConnectedAppByIdRequest(params: any, cb = () => {
}) {
  return {
    type: GET_CONNECTED_APP_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deleteConnectedAppRequest(params: DeleteConnectedApp, cb = () => {
}) {
  return {
    type: DELETE_CONNECTED_APP_REQUEST,
    params,
    cb,
  }
}

export function createConnectedAppRequest(params: CreateNewConnectedApp, cb = () => {
}) {
  return {
    type: CREATE_CONNECTED_APP_REQUEST,
    params,
    cb,
  }
}

export function editConnectedAppRequest(params: EditConnectedApp, cb = () => {
}) {
  return {
    type: EDIT_CONNECTED_APP_REQUEST,
    params,
    cb,
  }
}


