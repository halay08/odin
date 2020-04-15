import { SET_STEP_VALIDATION_ARRAY_DATA, SET_STEP_VIEW_STEP_NUMBER } from './constants';

export interface StepViewReducerState {
  stepComponentsData: any;
  currentStep: number,
}

export const initialState: StepViewReducerState = {
  stepComponentsData: [],
  currentStep: 0,
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    case SET_STEP_VIEW_STEP_NUMBER: {
      return {
        ...state,
        currentStep: action.params.stepNumber,
      }
    }

    case SET_STEP_VALIDATION_ARRAY_DATA: {

      return {
        ...state,
        stepComponentsData: action.params,
      }
    }
    default:
      return state;
  }
}

export default reducer;

