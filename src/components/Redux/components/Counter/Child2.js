import React from 'react'
import { connect } from '../../react-redux-src'
class Child2 extends React.Component {
  render() {
    return <div className="redux-counter-child">
      Child2
      {this.props.name}
      <span>
        {this.props.num}
      </span>
    </div>
  }
}
const mapStateToProps = (state, props) => {
  const { counter } = state
  return {
    num: counter.num,
    name: props.name
  }
}

export default connect(mapStateToProps, null)(Child2)

