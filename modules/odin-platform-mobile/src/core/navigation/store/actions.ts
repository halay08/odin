import { ADD_URL_TO_HISTORY, CLOSE_TAB } from "./constants";

export function addUrlPathToHistory(params: { path: string, title: string }) {
  return {
    type: ADD_URL_TO_HISTORY,
    params,
  }
}

export function closeTab(params: { path: string, title: string }) {
  return {
    type: CLOSE_TAB,
    params,
  }
}
