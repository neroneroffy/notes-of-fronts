/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 * ----
 * page TrafficControl
 *
 * @author ZhouHaitao
 * @Date 2019/4/4 0004
 * @Time: 18:59
 */
import React from 'react'
import { Provider } from 'unstated'
import Child1 from './Child1'
import Child2 from './Child2'
import CounterContainer from './store/Counter'

// const counter = new CounterContainer(123)

class Parent extends React.Component {
  render() {
    return <Provider inject={[]}>
      父组件
      <Child1/>
      <Child2/>
    </Provider>
  }
}

export default Parent
