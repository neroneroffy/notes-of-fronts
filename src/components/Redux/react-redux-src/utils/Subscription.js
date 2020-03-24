import { getBatch } from './batch'

// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

const CLEARED = null
const nullListeners = { notify() {} }

function createListenerCollection() {
  const batch = getBatch()
  // the current/next pattern is copied from redux's createStore code.
  // TODO: refactor+expose that code to be reusable here?
  let current = []
  let next = []

  return {
    clear() {
      // 清空next和current
      next = CLEARED
      current = CLEARED
    },

    notify() {
      // 将next赋值给current，并同时赋值给listeners
      const listeners = (current = next)
      // 批量执行listeners
      batch(() => {
        for (let i = 0; i < listeners.length; i++) {
          listeners[i]()
        }
      })
    },

    get() {
      return next
    },

    subscribe(listener) {
      let isSubscribed = true
      // 将current复制一份，并赋值给next，下边再向next中push  listener（更新页面的函数）
      if (next === current) next = current.slice()
      next.push(listener)
      return function unsubscribe() {
        if (!isSubscribed || current === CLEARED) return
        isSubscribed = false
        // 最终返回一个取消订阅的函数，用域再下一轮的时候清除没用的listener
        if (next === current) next = current.slice()
        next.splice(next.indexOf(listener), 1)
      }
    }
  }
}

export default class Subscription {
  constructor(store, parentSub) {
    // 获取store，要通过store来实现订阅
    this.store = store
    // 获取来自父级的subscription实例，主要是在connect的时候可能会用到
    this.parentSub = parentSub
    this.unsubscribe = null
    this.listeners = nullListeners

    this.handleChangeWrapper = this.handleChangeWrapper.bind(this)
  }

  addNestedSub(listener) {
    this.trySubscribe()
    // 因为这里是被parentSub调用的，所以listener也会被订阅到parentSub上，也就是从Provider中获取的subscription
    return this.listeners.subscribe(listener)
  }

  notifyNestedSubs() {
    // 通知listeners去执行
    this.listeners.notify()
  }

  handleChangeWrapper() {
    if (this.onStateChange) {
        // 在ConnectionFunction中，onStateChange被赋值为checkForUpdates，当store变化的时候，相当于checkForUpdates被调用，
        // 更新ConnectionFunction，从而更新页面，组件获取最新的props
        // onStateChange会在外部的被实例化成subcription实例的时候，被赋值为不同的更新函数，被赋值的地方分别的Provider和connect中
        this.onStateChange()
    }
  }

  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      // parentSub实际上是subcription实例
      // 这里判断的是this.unsubscribe被赋值后的值，本质上也就是判断parentSub有没有，顺便再赋值给this.unsubscribe
      // 如果parentSub没传，那么使用store订阅，否则，调用parentSub.addNestedSub。本质上是使用context中的subscription订阅
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.handleChangeWrapper)
        : this.store.subscribe(this.handleChangeWrapper)
      // 创建listener集合
      this.listeners = createListenerCollection()
    }
  }

  tryUnsubscribe() {
    // 取消订阅
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}
