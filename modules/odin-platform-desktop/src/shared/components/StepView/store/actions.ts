import { SET_STEP_VALIDATION_ARRAY_DATA, SET_STEP_VIEW_STEP_NUMBER } from './constants';

export interface IStepViewValidation {
  [key: number]: {
    isNextDisabled: boolean
  }
}

export interface IStepViewChangeStepNumber {
  stepNumber: number
}

export function changeStepNumber(params: IStepViewChangeStepNumber) {
  return {
    type: SET_STEP_VIEW_STEP_NUMBER,
    params,
  }
}


export function setStepValidationArray(params: IStepViewValidation[]) {
  return {
    type: SET_STEP_VALIDATION_ARRAY_DATA,
    params,
  }
}
