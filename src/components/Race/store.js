import { createStore, combineReducers, compose, applyMiddleware } from '../Redux/redux-src'
import thunk from 'redux-thunk'
import { global, view, reqStartLastTime, reqStartThisTime } from './reducer'
import reqTimeControl from './middleware'

const store = createStore(
  combineReducers({ global, view, reqStartLastTime, reqStartThisTime }),
  compose(
    applyMiddleware(reqTimeControl),
    window.devToolsExtension ? window.devToolsExtension() : f=>f
  )
)
export default store
