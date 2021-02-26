import React from 'react'
import { Button } from 'antd'
import { Subscribe } from 'unstated'
import CounterContainer from './store/Counter'

class Child2 extends React.Component {

  render() {
    return <Subscribe to={[CounterContainer]}>
      {
        counter => {
          return <div className="child2">
            {counter.state.count}
            <Button onClick={counter.increment}>增加</Button>
            <Button onClick={counter.decrement}>减少</Button>
            <Button
              type="primary"
              loading={counter.state.isLoading}
              onClick={counter.loadData}
            >加载数据</Button>
          </div>
        }
      }
    </Subscribe>
  }
}

export default Child2
