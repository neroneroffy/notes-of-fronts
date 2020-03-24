import React from 'react'
import { connect } from '../../react-redux-src'
import {increaseAction, decreaseAction, INCREASE, DECREASE} from '../../actions/counter'
import { Button } from 'antd'
class Child1 extends React.Component {
  render() {
    const { increaseAction, decreaseAction } = this.props
    return <div className="redux-counter-child">
      <span>
        <Button onClick={() => increaseAction()}>增加</Button>
        <Button onClick={() => decreaseAction()}>减少</Button>
      </span>
    </div>
  }
}
const mapStateToProps = state => state
const mapDispatchToProps = {
    increaseAction() {
      return dispatch => dispatch({
        type: INCREASE
      })
    },
    decreaseAction() {
      return dispatch => dispatch({
        type: DECREASE
      })
    }
  }
export default connect(mapStateToProps, mapDispatchToProps)(Child1)

