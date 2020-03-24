import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context'
import Subscription from '../utils/Subscription'

class Provider extends Component {
  constructor(props) {
    super(props)

    const { store } = props

    this.notifySubscribers = this.notifySubscribers.bind(this)
    const subscription = new Subscription(store)
    subscription.onStateChange = this.notifySubscribers

    this.state = {
      store,
      subscription
    }

    this.previousState = store.getState()
  }

  componentDidMount() {
    this._isMounted = true

    this.state.subscription.trySubscribe()
    // 如果前后的store中的state有变化，那么就去更新视图
    if (this.previousState !== this.props.store.getState()) {
      this.state.subscription.notifyNestedSubs()
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()

    this.state.subscription.tryUnsubscribe()

    this._isMounted = false
  }

  componentDidUpdate(prevProps) {
    if (this.props.store !== prevProps.store) {
      this.state.subscription.tryUnsubscribe()
      const subscription = new Subscription(this.props.store)
      // 将this.notifySubscribers 赋值给 onStateChange，onStateChange等于一堆listener，
      // 一旦onStateChange被调用，listeners也就会排队执行，更新页面。
      // componentDidUpdate中做这些事情应该是为了处理Provider中嵌套Provider，或者provider被嵌套在其他父组件中的情况。例如Provider1嵌套Provider2,
      // Provider1更新，会触发Provider2中的componentDidUpdate执行，这个时候onStateChange又被赋值为一堆listeners。
      // 而这堆listeners是在Provider2的componentDidMount中被this.state.subscription.trySubscribe()的，所以这样是为了在父组件更新时候能让子provider也更新
      subscription.onStateChange = this.notifySubscribers
      this.setState({ store: this.props.store, subscription })
    }
  }

  notifySubscribers() {
    this.state.subscription.notifyNestedSubs()
  }

  render() {
    const Context = this.props.context || ReactReduxContext

    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

Provider.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }),
  context: PropTypes.object,
  children: PropTypes.any
}

export default Provider
