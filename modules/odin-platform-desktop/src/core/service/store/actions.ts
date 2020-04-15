import {
  DELETE_SIPWISE_CUSTOMER_CONTACT_REQUEST,
  DELETE_SIPWISE_CUSTOMER_REQUEST,
  DELETE_SIPWISE_SUBSCRIBER_REQUEST,
  GET_SIPWISE_CUSTOMER_CONTACT_REQUEST,
  GET_SIPWISE_CUSTOMER_REQUEST,
  GET_SIPWISE_FULL_PROFILE_REQUEST,
  GET_SUBSCRIBER_REQUEST,
} from './constants';

export interface IGetSipwiseFullProfile {
  recordId: string,
  contact_id: string,
}

export interface IGetSipwiseCustomerContact {
  recordId: string,
  contact_id: string,
}

export interface IGetSipwiseSubscriber {
  recordId: string,
  contact_id: string
}

export interface IGetSipwiseCustomer {
  recordId: string,
  contact_id: string
}

export interface IDeleteSipwiseSubscriber {
  recordId: string,
  contact_id: string
  subscriberId: string,
}

export interface IDeleteSipwiseCustomer {
  recordId: string,
  contact_id: string
  customerId: string,
}

export interface IDeleteSipwiseCustomerContact {
  recordId: string,
  contact_id: string
  customerContactId: string,
}


export function getSipwiseFullProfileRequest(params: IGetSipwiseFullProfile) {
  return {
    type: GET_SIPWISE_FULL_PROFILE_REQUEST,
    params,
  };
}


export function getSipwiseCustomerContactRequest(params: IGetSipwiseCustomerContact) {
  return {
    type: GET_SIPWISE_CUSTOMER_CONTACT_REQUEST,
    params,
  };
}


export function deleteSipwiseCustomerContactRequest(params: IDeleteSipwiseCustomerContact) {
  return {
    type: DELETE_SIPWISE_CUSTOMER_CONTACT_REQUEST,
    params,
  };
}


export function getSipwiseCustomerRequest(params: IGetSipwiseCustomer) {
  return {
    type: GET_SIPWISE_CUSTOMER_REQUEST,
    params,
  };
}


export function deleteSipwiseCustomerRequest(params: IDeleteSipwiseCustomer) {
  return {
    type: DELETE_SIPWISE_CUSTOMER_REQUEST,
    params,
  };
}


export function getSipwiseSubscriberRequest(params: IGetSipwiseSubscriber) {
  return {
    type: GET_SUBSCRIBER_REQUEST,
    params,
  };
}

export function deleteSipwiseSubscriberRequest(params: IDeleteSipwiseSubscriber) {
  return {
    type: DELETE_SIPWISE_SUBSCRIBER_REQUEST,
    params,
  };
}


