import * as actionTypes from '../actions/counter'
const initialState = {
  num: 10
}
export function counter(state = initialState, actions) {
  switch (actions.type) {
    case actionTypes.INCREASE:
      return {
        ...state,
        num: state.num+=1
      }
    case actionTypes.DECREASE:
      return {
        ...state,
        num: state.num-=1
      }
    default:
      return state
  }
}
