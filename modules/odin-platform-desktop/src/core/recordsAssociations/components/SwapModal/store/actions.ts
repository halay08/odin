import { CLOSE_SWAP_MODAL, INITIALIZE_SWAP_MODAL } from "./constants";


export function initializeSwapModal(params: any) {
  return {
    type: INITIALIZE_SWAP_MODAL,
    params,
  }
}

export function closeSwapModal() {
  return {
    type: CLOSE_SWAP_MODAL
  }
}



