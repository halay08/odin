import { ADD_URL_TO_HISTORY, CLOSE_TAB } from "./constants";

export interface NavigationReducer {
  history: { path: string, title: string }[],
  previousPage: string,
  currentPage: string,
}

export const initialState: NavigationReducer = {
  history: [],
  previousPage: '',
  currentPage: '',
};

function reducer(state = initialState, action: any) {
  switch (action.type) {
    case ADD_URL_TO_HISTORY: {
      const stateCopy = state.history;
      let newHistory: { path: string, title: string }[] = state.history;

      if(state.history.length > 0 && state.history.length < 7) {
        if(!state.history.find(elem => elem.path === action.params.path)) {
          newHistory.push({ path: action.params.path, title: action.params.title });
        }
      } else if(state.history.length > 6) {
        // remove the first elem of the history
        stateCopy.shift();
        if(!state.history.find(elem => elem.path === action.params.path)) {
          newHistory = [ ...stateCopy, ...[ { path: action.params.path, title: action.params.title } ] ];
        }
      } else {
        newHistory.push({ path: action.params.path, title: action.params.title });
      }

      return {
        ...state,
        history: newHistory,
        previousPage: newHistory.length > 1 ? newHistory[newHistory.length - 2].path : newHistory[0].path,
        currentPage: action.params.path,
      }
    }

    case CLOSE_TAB: {
      let newHistory: { path: string, title: string }[] = state.history;
      newHistory = newHistory.filter(elem => elem.path !== action.params.path);

      return {
        ...state,
        history: newHistory,
        previousPage: newHistory.length > 0 ? newHistory[newHistory.length - 1] : newHistory[0],
      }
    }

    default:
      return state;
  }
}

export default reducer;
