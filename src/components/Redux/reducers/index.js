import { combineReducers } from '../redux-src'
import { counter } from './counter'
import { sync } from './sync'
const rootReducer = combineReducers({
  counter,
  sync
})

export default rootReducer
