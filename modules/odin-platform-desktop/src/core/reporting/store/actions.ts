import {
  GET_BILLING_OVERVIEW_REQUEST,
  GET_DAILY_SALES_METRICS_REQUEST,
  GET_INVESTIGATION_OVERVIEW_REQUEST,
  GET_ORDERS_OVERVIEW_REQUEST,
  GET_PIPELINES_OVERVIEW_REQUEST,
  GET_PIPELINES_RAG_OVERVIEW_REQUEST,
  GET_RECORD_COUNTS_REQUEST,
  GET_TRANSACTION_OVERVIEW_REQUEST,
  GET_WEEKLY_SALES_METRICS_REQUEST,
} from './constants';


export function getDailySalesMetrics() {
  return {
    type: GET_DAILY_SALES_METRICS_REQUEST,
  }
}

export function getWeeklySalesMetrics() {
  return {
    type: GET_WEEKLY_SALES_METRICS_REQUEST,
  }
}

export function getPipelinesOverviewRequest(params: { moduleName?: string, entityName?: string }) {
  return {
    type: GET_PIPELINES_OVERVIEW_REQUEST,
    params,
  }
}

export function getPipelinesRagOverviewRequest(params: { moduleName?: string, entityName?: string }) {
  return {
    type: GET_PIPELINES_RAG_OVERVIEW_REQUEST,
    params,
  }
}


export function getOrdersOverviewRequest(params: { orderStageKey: string }) {
  return {
    type: GET_ORDERS_OVERVIEW_REQUEST,
    params,
  }
}

export function getBillingOverviewRequest() {
  return {
    type: GET_BILLING_OVERVIEW_REQUEST,
  }
}

export function getRecordCountsRequest() {
  return {
    type: GET_RECORD_COUNTS_REQUEST,
  }
}

export function getInvestigationOverviewRequest() {
  return {
    type: GET_INVESTIGATION_OVERVIEW_REQUEST,
  }
}

export function getTransactionOverviewRequest() {
  return {
    type: GET_TRANSACTION_OVERVIEW_REQUEST,
  }
}
