export const INCREASE = 'INCREASE'
export const DECREASE = 'DECREASE'

export const increaseAction = () => dispatch => dispatch({
  type: INCREASE
})
export const decreaseAction = () => dispatch => dispatch({
  type: DECREASE
})
