export const DISPLAY_MESSAGE = 'DISPLAY_MESSAGE';
export const RESET_MESSAGE = 'RESET_MESSAGE';

export function displayMessage(message: { body: string, type: string }) {
  return {
    type: DISPLAY_MESSAGE,
    ui: {
      hasError: true,
      placement: 'bottomRight',
    },
    message: {
      body: message.body,
      type: message.type,
    },
  }
}

export function resetMessage() {
  return {
    type: RESET_MESSAGE,
    ui: {
      hasError: false,
      placement: null,
    },
    message: {
      body: null,
      type: null,
    },
  }
}

export const initialState = {
  ui: {
    hasError: false,
    placement: null,
  },
  message: {
    body: null,
    type: null,
  },
};


function reducer(state = initialState, action: any) {

  switch (action.type) {
    case DISPLAY_MESSAGE: {
      return {
        ui: {
          hasError: true,
          placement: action.placement,
        },
        message: {
          body: action.message.body,
          type: action.message.type,
        },
      }
    }
    case RESET_MESSAGE: {
      return {
        ...initialState,
      }
    }
    default:
      return state;
  }
}

export default reducer;

