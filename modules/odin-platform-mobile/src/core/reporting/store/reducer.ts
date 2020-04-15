import {
  GET_BILLING_OVERVIEW_ERROR,
  GET_BILLING_OVERVIEW_REQUEST,
  GET_BILLING_OVERVIEW_SUCCESS,
  GET_DAILY_SALES_METRICS_ERROR,
  GET_DAILY_SALES_METRICS_REQUEST,
  GET_DAILY_SALES_METRICS_SUCCESS,
  GET_INVESTIGATION_OVERVIEW_ERROR,
  GET_INVESTIGATION_OVERVIEW_REQUEST,
  GET_INVESTIGATION_OVERVIEW_SUCCESS,
  GET_ORDERS_OVERVIEW_ERROR,
  GET_ORDERS_OVERVIEW_REQUEST,
  GET_ORDERS_OVERVIEW_SUCCESS,
  GET_PIPELINES_OVERVIEW_ERROR,
  GET_PIPELINES_OVERVIEW_REQUEST,
  GET_PIPELINES_OVERVIEW_SUCCESS,
  GET_PIPELINES_RAG_OVERVIEW_ERROR,
  GET_PIPELINES_RAG_OVERVIEW_REQUEST,
  GET_PIPELINES_RAG_OVERVIEW_SUCCESS,
  GET_RECORD_COUNTS_ERROR,
  GET_RECORD_COUNTS_REQUEST,
  GET_RECORD_COUNTS_SUCCESS,
  GET_TRANSACTION_OVERVIEW_ERROR,
  GET_TRANSACTION_OVERVIEW_REQUEST,
  GET_TRANSACTION_OVERVIEW_SUCCESS,
  GET_WEEKLY_SALES_METRICS_ERROR,
  GET_WEEKLY_SALES_METRICS_REQUEST,
  GET_WEEKLY_SALES_METRICS_SUCCESS,
} from "./constants";

export interface ReportReducerState {
  isDailyRequesting: boolean,
  isWeeklyRequesting: boolean,
  isPipelinesRequesting: boolean,
  isPipelinesRagRequesting: boolean,
  isOrdersRequesting: boolean,
  isBillingRequesting: boolean,
  isCountsRequesting: boolean,
  isInvestigationRequesting: boolean,
  isTransactionsRequesting: boolean,
  dailyMetrics: any,
  weeklyMetrics: any,
  pipelinesOverview: any,
  pipelinesRagOverview: any,
  ordersOverview: any,
  billingOverview: any,
  recordCounts: any,
  investigating: any,
  transactions: any,
}


export const initialState: ReportReducerState = {
  isDailyRequesting: false,
  isWeeklyRequesting: false,
  isPipelinesRequesting: false,
  isPipelinesRagRequesting: false,
  isOrdersRequesting: false,
  isBillingRequesting: false,
  isCountsRequesting: false,
  isInvestigationRequesting: false,
  isTransactionsRequesting: false,
  dailyMetrics: {
    dailyArpu: {},
    visitsByAgent: [],
    visitOutcomes: [],
    leadsByAgent: [],
    ordersByAgent: [],
  },
  weeklyMetrics: {
    orderProductMix: [],
    orderRevenueByUser: [],
    weeklyArpu: {},
  },
  pipelinesOverview: [],
  pipelinesRagOverview: [],
  ordersOverview: {
    periord: '',
    orders: [],
    orderProductMix: [],
    arpu: {},
    counts: [],
  },
  billingOverview: {
    transactions: [],
    paymentMethods: [],
    counts: [],
  },
  recordCounts: [],
  investigating: {
    ordersNoPaymentMethods: [],
    ordersPaymentMethodIssues: [],
    orderItemsNotAssociatedWithAnOrder: [],
  },
  transactions: {
    activeOrders: [],
    activeOrderItems: [],
    invoices: [],
    transactions: [],
  },
};

function reducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_DAILY_SALES_METRICS_REQUEST: {
      return {
        ...state,
        isDailyRequesting: true,
      }
    }
    case GET_DAILY_SALES_METRICS_SUCCESS: {
      return {
        ...state,
        isDailyRequesting: false,
        dailyMetrics: action.results.data,
      }
    }
    case GET_DAILY_SALES_METRICS_ERROR: {
      return {
        ...state,
        isDailyRequesting: false,
      }
    }

    case GET_WEEKLY_SALES_METRICS_REQUEST: {
      return {
        ...state,
        isWeeklyRequesting: true,
      }
    }
    case GET_WEEKLY_SALES_METRICS_SUCCESS: {
      return {
        ...state,
        isWeeklyRequesting: false,
        weeklyMetrics: action.results.data,
      }
    }
    case GET_WEEKLY_SALES_METRICS_ERROR: {
      return {
        ...state,
        isWeeklyRequesting: false,
      }
    }

    case GET_PIPELINES_OVERVIEW_REQUEST: {
      return {
        ...state,
        isPipelinesRequesting: true,
      }
    }
    case GET_PIPELINES_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isPipelinesRequesting: false,
        pipelinesOverview: action.results.data,
      }
    }
    case GET_PIPELINES_OVERVIEW_ERROR: {
      return {
        ...state,
        isPipelinesRequesting: false,
      }
    }


    case GET_PIPELINES_RAG_OVERVIEW_REQUEST: {
      return {
        ...state,
        isPipelinesRagRequesting: true,
      }
    }
    case GET_PIPELINES_RAG_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isPipelinesRagRequesting: false,
        pipelinesRagOverview: action.results.data,
      }
    }
    case GET_PIPELINES_RAG_OVERVIEW_ERROR: {
      return {
        ...state,
        isPipelinesRagRequesting: false,
      }
    }

    case GET_ORDERS_OVERVIEW_REQUEST: {
      return {
        ...state,
        isOrdersRequesting: true,
      }
    }
    case GET_ORDERS_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isOrdersRequesting: false,
        ordersOverview: action.results.data,
      }
    }
    case GET_ORDERS_OVERVIEW_ERROR: {
      return {
        ...state,
        isOrdersRequesting: false,
      }
    }

    case GET_BILLING_OVERVIEW_REQUEST: {
      return {
        ...state,
        isBillingRequesting: true,
      }
    }
    case GET_BILLING_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isBillingRequesting: false,
        billingOverview: action.results.data,
      }
    }
    case GET_BILLING_OVERVIEW_ERROR: {
      return {
        ...state,
        isBillingRequesting: false,
      }
    }

    case GET_RECORD_COUNTS_REQUEST: {
      return {
        ...state,
        isCountsRequesting: true,
      }
    }
    case GET_RECORD_COUNTS_SUCCESS: {
      return {
        ...state,
        isCountsRequesting: false,
        recordCounts: action.results.data,
      }
    }
    case GET_RECORD_COUNTS_ERROR: {
      return {
        ...state,
        isCountsRequesting: false,
      }
    }

    case GET_INVESTIGATION_OVERVIEW_REQUEST: {
      return {
        ...state,
        isInvestigationRequesting: true,
      }
    }
    case GET_INVESTIGATION_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isInvestigationRequesting: false,
        investigating: action.results.data,
      }
    }
    case GET_INVESTIGATION_OVERVIEW_ERROR: {
      return {
        ...state,
        isInvestigationRequesting: false,
      }
    }

    case GET_TRANSACTION_OVERVIEW_REQUEST: {
      return {
        ...state,
        isTransactionsRequesting: true,
      }
    }
    case GET_TRANSACTION_OVERVIEW_SUCCESS: {
      return {
        ...state,
        isTransactionsRequesting: false,
        transactions: action.results.data,
      }
    }
    case GET_TRANSACTION_OVERVIEW_ERROR: {
      return {
        ...state,
        isTransactionsRequesting: false,
      }
    }

    default:
      return state;
  }
}

export default reducer;

