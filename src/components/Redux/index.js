import React from 'react'
import { Provider } from './react-redux-src'
import store from './store'
import Counter from './components/Counter/index'
import Sync from './components/Sync'
import './index.css'
const ReduxExp = () => {
  return <Provider store={store}>
     <Counter/>
     <Sync/>
    </Provider>
}
export default ReduxExp
