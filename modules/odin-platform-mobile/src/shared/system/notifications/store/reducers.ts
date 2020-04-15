import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { ClassValidatorExceptionType } from "@d19n/common/dist/exceptions/types/ClassValidatorExceptionType";

export const ERROR_NOTIFICATION = 'ERROR_NOTIFICATION';
export const RESET_NOTIFICATION = 'RESET_NOTIFICATION';

export function errorNotification(error: ExceptionType) {
  return {
    type: ERROR_NOTIFICATION,
    ui: {
      hasError: true,
      placement: 'bottomRight',
    },
    error: {
      message: error.message,
      validation: error.validation,
      data: error.data,
    },
  }
}

export function resetNotification() {
  return {
    type: RESET_NOTIFICATION,
    ui: {
      hasError: false,
      placement: null,
    },
    error: {
      message: null,
      validation: [],
      data: null,
    },
  }
}

export const initialState = {
  ui: {
    hasError: false,
    placement: null,
  },
  error: {
    message: null,
    validation: [],
    data: null,
  },
};


function reducer(state = initialState, action: any) {


  function parseClassValidator(validation: ClassValidatorExceptionType[] | undefined | any[] | any | null) {
    if(!!validation && validation.length > 0) {
      const property = validation[0].property;
      const value = validation[0].value;
      return `error validating ${property} with value ${value}`;
    }
  }

  switch (action.type) {
    case ERROR_NOTIFICATION: {
      return {
        ui: {
          hasError: true,
          placement: action.placement,
        },
        error: {
          message: action.error.message,
          validation: parseClassValidator(action.error.validation),
          data: action.error.data,
        },
      }
    }
    case RESET_NOTIFICATION: {
      return {
        ui: {
          hasError: false,
          placement: null,
        },
        error: {
          message: null,
          validation: [],
          data: null,
        },
      }
    }
    default:
      return state;
  }
}

export default reducer;

