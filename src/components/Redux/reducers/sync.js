import * as actionTypes from '../actions/sync'
const initialState = {
  phone: '等待加载...'
}
export function sync(state = initialState, actions) {
  switch (actions.type) {
    case actionTypes.LOAD_SUCCESS:
      return {
        ...state,
        phone: actions.data.results[0].phone
      }
    default:
      return state
  }
}
