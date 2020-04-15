import {
  SEND_CONFIRMATION_EMAIL_ERROR,
  SEND_CONFIRMATION_EMAIL_REQUEST,
  SEND_CONFIRMATION_EMAIL_SUCCESS,
} from "./constants";

export const initialState = {
  isRequesting: false,
  path: null,
};

function reducer(state = initialState, action: any) {
  switch (action.type) {

    case SEND_CONFIRMATION_EMAIL_REQUEST:
      return {
        ...state,
        isRequesting: true,
        path: action.path,
      };
    case SEND_CONFIRMATION_EMAIL_SUCCESS:
      return {
        ...state,
        isRequesting: false,
      };
    case SEND_CONFIRMATION_EMAIL_ERROR:
      return {
        ...state,
        isRequesting: false,
      };
    default:
      return state;
  }
}

export default reducer;
