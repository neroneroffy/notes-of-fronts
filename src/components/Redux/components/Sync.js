import React from 'react'
import { loadData } from '../actions/sync'
import { connect } from '../react-redux-src'
import { Button } from 'antd'
class Sync extends React.Component {
  render() {
    const { loadDataSync, phone } = this.props
    return <div className="redux-sync">
      { phone }
      <Button onClick={() => {loadDataSync()}}>加载数据</Button>
    </div>
  }
}
const mapStateToProps = state => {
  const { sync } = state
  return {
    phone: sync.phone
  }
}
const mapDispatchToProps = dispatch => {
  return {
    loadDataSync: () => dispatch(loadData())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Sync)
