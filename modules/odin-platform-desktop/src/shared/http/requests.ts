import axios from 'axios';
import { getHostName } from './helpers';

export function httpGet<T>(path: string, params?: any) {
  const token = localStorage.getItem(`token`);
  return axios({
    method: 'get',
    timeout: 60 * 1000,
    params: params,
    url: `${getHostName()}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
}

export function httpPost<T>(path: string, body: T) {
  const token = localStorage.getItem(`token`);
  return axios({
    method: 'post',
    timeout: 60 * 1000,
    url: `${getHostName()}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}


export function httpPut<T>(path: string, body: T) {
  const token = localStorage.getItem(`token`);
  return axios({
    method: 'put',
    timeout: 60 * 1000,
    url: `${getHostName()}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

export function httpPatch<T>(path: string, body: T) {
  const token = localStorage.getItem(`token`);
  return axios({
    method: 'patch',
    timeout: 60 * 1000,
    url: `${getHostName()}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}


export function httpDelete<T>(path: string, body?: T) {
  const token = localStorage.getItem(`token`);
  return axios({
    method: 'delete',
    timeout: 60 * 1000,
    url: `${getHostName()}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
    data: body
  });
}

export function httpFileUpload<T>(path: string, body: T) {
  const token = localStorage.getItem(`token`);
  return axios({
    method: 'post',
    timeout: 60 * 1000,
    url: `${getHostName()}/${path}`,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + token,
    },
    data: body,
  });
}

