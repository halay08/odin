import { ADD_PATH_TO_HISTORY, ADD_TAB_TO_HISTORY, CLOSE_TAB } from './constants';

export interface NavigationReducer {
  tabHistory: { path: string, title: string }[],
  previousPage: string,
}

export const initialState: NavigationReducer = {
  tabHistory: [],
  previousPage: '',
};

function reducer(state = initialState, action: any) {

  switch (action.type) {

    case ADD_PATH_TO_HISTORY: {

      if(action.params.path) {

        /* We exclude Login, 403, 500 from our appHistory monitoring */
        if(
          action.params.path === '/login' ||
          action.params.path === '/403' ||
          action.params.path === '/500'
        ) {
          return state
        } else {
          return {
            ...state,
            previousPage: action.params.path,
          }
        }

      } else return state

    }

    case ADD_TAB_TO_HISTORY: {
      const stateCopy = state.tabHistory;
      let newHistory: { path: string, title: string }[] = state.tabHistory || [];

      if(state.tabHistory && state.tabHistory.length > 0 && state.tabHistory.length < 10) {
        if(!state.tabHistory.find(elem => elem.path === action.params.path)) {
          newHistory.push({ path: action.params.path, title: action.params.title });
        }
      } else if(state.tabHistory && state.tabHistory.length > 9) {
        // remove the first elem of the history
        stateCopy.shift();
        if(state.tabHistory && !state.tabHistory.find(elem => elem.path === action.params.path)) {
          newHistory = [ ...stateCopy, ...[ { path: action.params.path, title: action.params.title } ] ];
        }
      } else {
        newHistory.push({ path: action.params.path, title: action.params.title });
      }

      return {
        ...state,
        tabHistory: newHistory,
      }
    }

    case CLOSE_TAB: {
      let newHistory: { path: string, title: string }[] = state.tabHistory;
      newHistory = newHistory.filter(elem => elem.path !== action.params.path);

      return {
        ...state,
        tabHistory: newHistory,
      }
    }

    default:
      return state;
  }
}

export default reducer;
