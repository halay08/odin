import {
  CREATE_ORDER_MODAL_VISIBILE,
  ORDER_WORKFOLOW_CHECKOUT_REQUEST,
  SELECT_ORDER_TYPE_MODAL_VISIBILE,
  UPDATE_ORDER_WORKFLOW,
} from './constants';

export interface product {
  recordId: string | undefined 
}

export interface IOrderCheckout {
  addressId: string | undefined,
  contactId: string | undefined,
  products: product[],
  discountCode?: string
}

export function createOrderVisible() {
  return {
    type: CREATE_ORDER_MODAL_VISIBILE,
  }
}

export function orderTypeModalVisible() {
  return {
    type: SELECT_ORDER_TYPE_MODAL_VISIBILE,
  }
}

export function updateOrderWorkflow(params: any) {
  return {
    type: UPDATE_ORDER_WORKFLOW,
    params 
  }
}

export function orderCheckoutRequest(params: IOrderCheckout, cb = () => {}) {
  return {
    type: ORDER_WORKFOLOW_CHECKOUT_REQUEST,
    params,
    cb
  }
}


