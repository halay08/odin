import { ADD_PATH_TO_HISTORY, ADD_TAB_TO_HISTORY, CLOSE_TAB } from "./constants";

export function addPathToHistory(params: { path: string }) {
  return {
    type: ADD_PATH_TO_HISTORY,
    params,
  }
}

export function addTabToHistory(params: { path: string, title: string }) {
  return {
    type: ADD_TAB_TO_HISTORY,
    params,
  }
}

export function closeTab(params: { path: string, title: string }) {
  return {
    type: CLOSE_TAB,
    params,
  }
}
