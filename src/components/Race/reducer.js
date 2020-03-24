import * as actionTypes from './actions'


export const global = (state = {
  loading: false,
}, action) => {
  switch (action.type) {
    case actionTypes.LOGING_BEGIN:
      return {
        ...state,
        loading: true,
      }
    case actionTypes.LOGING_END:
      return {
        ...state,
        loading: false,
      }
    default:
      return state
  }
}
export const reqStartThisTime = (state = 0, action) => {
  switch (action.type) {
    case '__RECORD_REQUEST_THIS_TIME__':
      return action.payload
    default:
      return state
  }
}
export const reqStartLastTime = (state = 0, action) => {
  switch (action.type) {
    case '__RECORD_REQUEST_START_POINT__':
      return action.payload
    default:
      return state
  }
}

export const view = (state = { result: '未加载' }, action) => {
  switch (action.type) {
    case actionTypes.FETCH_SUCCESS:
      return {
        ...state,
        result: action.payload.result,
      }
    case actionTypes.FETCH_BEGIN:
      return {
        ...state,
        result: '加载中...'
      }
    default:
      return state
  }
}
