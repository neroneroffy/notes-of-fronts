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
import { Subscribe } from 'unstated'
import CounterContainer from './store/Counter'

class Child1 extends React.Component {
  render() {
    return <Subscribe to={[CounterContainer]}>
      {
        counter => {
          return <div className="child1">
            <h2>数字：{counter.state.count}</h2>
            <h2>电话：{counter.state.phone}</h2>
            </div>
        }
      }

    </Subscribe>
  }
}

export default Child1
