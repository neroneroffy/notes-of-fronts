/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 * ----
 * page TrafficControl
 *
 * @author ZhouHaitao
 * @Date 2019/5/5 0005
 * @Time: 10:15
 */
import { createStore, compose, applyMiddleware } from './redux-src'
import thunk from './redux-thunk-src'
import rootReducer from './reducers'

const store = createStore(rootReducer,
  applyMiddleware(thunk),
)

export default store
