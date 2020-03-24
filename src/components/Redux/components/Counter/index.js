import React from 'react'
import Child1 from './Child1'
import Child2 from './Child2'
// import Child3 from './Child3'
class Counter extends React.Component {
  state = {
    name: 'ppppp'
  }
  render() {
    return <div className="redux-counter">
      <Child1/>
      <Child2 name={this.state.name}/>
{/*      <Child3/>
      <button onClick={() => {
        this.setState({ name: (Math.random() * 10).toFixed(2) })
      }}>点击改变名称</button>*/}
    </div>
  }
}
export default Counter

