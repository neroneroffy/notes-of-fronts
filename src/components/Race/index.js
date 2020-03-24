import React from 'react'
import Main from './main.js'
import { Provider } from 'react-redux'
import store from './store'
function Race() {
  return <div>
    <Provider store={store}>
      <Main/>
    </Provider>
  </div>
}

export default Race
