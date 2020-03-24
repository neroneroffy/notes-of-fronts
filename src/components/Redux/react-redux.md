# 带着问题看React-Redux源码

## 写在前面
我在读React-Redux源码的过程中，很自然的要去网上找一些参考文章，但发现这些文章基本都没有讲的很透彻，
很多时候平铺直叙把API挨个讲一下，而且只讲某一行代码是做什么的，却没有结合应用场景和用法解释清楚为什么这么做，而源码本身又很抽象，
函数间的调用关系非常不好梳理清楚，最终结果就是越看越懵。我这次将尝试换一种解读方式，由最常见的用法入手，
结合用法，提出问题，带着问题看源码里是如何实现的，以此来和大家一起逐渐梳理清楚React-Redux的运行机制。

文章用了一周多的时间写完，粗看了一遍源码之后，又边看边写。源码不算少，我尽量把结构按照最容易理解的方式梳理，努力按照浅显的方式将原理讲出来，
但架不住代码结构的复杂，很多地方依然需要花时间思考，捋清函数之间的调用关系并结合用法才能明白。文章有点长，能看到最后的都是真爱~

水平有限，难免有地方解释的不到位或者有错误，也希望大家能帮忙指出来，不胜感激。

## React-Redux在项目中的应用
在这里，我就默认大家已经会使用Redux了，它为我们的应用提供一个全局的对象（store）来管理状态。
那么如何最方便的将Redux应用在React中呢？可以使用Context这个特性，我们的最终目的是实现跨层级组件间通信。
* 将创建一个Provider，将store传入Provider，作为当前context的值
* 组件获取数据时候，将其放入Consumer中，获取到store，使用store.getState()获取数据
* 组件需要更新数据时，需要调用store.dispatch派发action

而这些都需要自己手动去做，React-Redux将上边的都封装起来了。让我们通过一段代码看一下React-Redux的用法：

首先是在React的最外层应用上，包裹Provider，而Provider是React-Redux提供的组件，这里做的事情相当于上边的第一步

```
import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
const reducer = (state, actions) => {
  ...
}
const store = createStore(reducer)
...

class RootApp extends React.Component {
  render() {
   // 这里将store传入Provider
    return <Provider store={store}>
      <App/>
    </Provider>
  }
}
```

再看应用内的子组件。如果需要从store中拿数据或者更新store数据的话（相当于上边的第二步和第三步），
需要用connect将组件包裹起来：

```
import React from 'react'
import { connect } from '../../react-redux-src'
import { increaseAction, decreaseAction } from '../../actions/counter'
import { Button } from 'antd'
class Child extends React.Component {
  render() {
    const { increaseAction, decreaseAction, num } = this.props
    return <div>
        {num}
        <Button onClick={() => increaseAction()}>增加</Button>
        <Button onClick={() => decreaseAction()}>减少</Button>
    </div>
  }
}
const mapStateToProps = (state, ownProps) => {
  const { counter } = state
  return {
    num: counter.num
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    increaseAction: () => dispatch({
      type: INCREASE
    }),
    decreaseAction: () => dispatch({
      type: DECREASE
    })
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Child)
```
mapStateToProps 用于建立组件和store中存储的状态的映射关系，它是一个函数，第一个参数是state，也就是redux中的顶层数据，
第二个参数是组件自身的props。返回一个对象，对象内的字段就是该组件需要从store中取的值。

mapDispatchToProps用于建立组件跟store.dispatch的映射关系。它可以是一个对象，也可以是一个函数，
当它是一个函数的时候，第一个参数就是dispatch，第二个参数是组件自身的props。

mapDispatchToProps的对象形式如下：
```
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
```

当不传mapStateToProps的时候，当store变化的时候，不会引起组件UI的更新。

当不传mapDispatchToProps的时候，默认将dispatch注入到组件的props中。

以上，如果mapStateToProps 或者 mapDispatchToProps传了ownProps，那么在组件自身的props变化的时候，这两个函数也都会被调用。

## React-Redux做了什么

通过上面的用法，我们总结一下，React-Redux做了什么工作：
* 提供Provider，将store传入Provider，便于下层组件从context或者props中获取store
* 提供connect高阶组件，主要做了两件事：
  - 从context中获取store，注入组件的props
  - 将store的dispatch方法注入组件的props 或者 将我们自定义调用dispatch的方法注入到组件的props中

## 如何实现的

在看源码的时候，建议带着这几个问题去看：
* Provider是怎么把store放入context中的
* 如何将store中的state和dispatch(或者调用dispatch的函数)注入组件的props中的
* 我们都知道在Redux中，可以通过store.subscribe()订阅一个更新页面的函数，来实现store变化，更新UI，而React-Redux是如何做到
store变化，被connect的组件也会更新的


接下来，带着这些问题来一条一条地分析源码。

## Provider是怎么把store放入context中的
我们先来看一下Provider组件，代码不多，直接上源码

```
class Provider extends Component {
  constructor(props) {
    super(props)
    // 从props中取出store
    const { store } = props
    this.notifySubscribers = this.notifySubscribers.bind(this)
    // 声明一个Subscription实例。订阅，监听state变化来执行listener，都由实例来实现。
    const subscription = new Subscription(store)
    // 绑定监听，当state变化时，通知订阅者更新页面
    subscription.onStateChange = this.notifySubscribers
    // 将store和subscription放入state中，稍后this.state将会作为context的value
    this.state = {
      store,
      subscription
    }
    // 获取当前的store中的state，作为上一次的state，将会在组件挂载完毕后，
    // 与store新的state比较，不一致的话更新Provider组件
    this.previousState = store.getState()
  }

  componentDidMount() {
    this._isMounted = true

    // 在组件挂载完毕后，订阅更新。至于如何订阅的，在下边讲到Subscription类的时候会讲到，
    // 这里先理解为最开始的时候需要订阅更新函数，便于在状态变化的时候更新Provider组件
    this.state.subscription.trySubscribe()

    // 如果前后的store中的state有变化，那么就去更新Provider组件
    if (this.previousState !== this.props.store.getState()) {
      this.state.subscription.notifyNestedSubs()
    }
  }

  componentWillUnmount() {
    // 组件卸载的时候，取消订阅
    if (this.unsubscribe) this.unsubscribe()
    this.state.subscription.tryUnsubscribe()
    this._isMounted = false
  }

  componentDidUpdate(prevProps) {
    // 在组件更新的时候，检查一下当前的store与之前的store是否一致，若不一致，说明应该根据新的数据做变化，
    // 那么依照原来的数据做出改变已经没有意义了，所以会先取消订阅，再重新声明Subscription实例，绑定监听，设置state为新的数据
    if (this.props.store !== prevProps.store) {
      this.state.subscription.tryUnsubscribe()
      const subscription = new Subscription(this.props.store)
      subscription.onStateChange = this.notifySubscribers
      this.setState({ store: this.props.store, subscription })
    }
  }

  notifySubscribers() {
    // notifyNestedSubs() 实际上会通知让listener去执行，作用也就是更新UI
    this.state.subscription.notifyNestedSubs()
  }

  render() {
    const Context = this.props.context || ReactReduxContext
    // 将this.state作为context的value传递下去
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

```
所以结合代码看这个问题：**Provider是怎么把store放入context中的**，很好理解。
Provider最主要的功能是从props中获取我们传入的store，并将store作为context的其中一个值，向下层组件下发。

但是，一旦store变化，Provider要有所反应，以此保证将最新的store放入context中。这里要引出Subscription类，通过该类的实例，将onStateChange监听到一个可更新UI的事件
`this.notifySubscribers`上：
```
subscription.onStateChange = this.notifySubscribers
```

组件挂载完成后，去订阅更新，至于这里订阅的是什么，要看Subscription的实现。这里先给出结论：本质上订阅的是`onStateChange`，订阅的函数是
Subscription类之内的`trySubscribe`
```
this.state.subscription.trySubscribe()
```

再接着，如果前后的state不一样，那么就去通知订阅者更新，onStateChange就会执行，Provider组件就会更新。走到更新完成（componentDidUpdate）,
会去比较一下前后的store是否相同，如果不同，那么用新的store作为context的值，并且取消订阅，重新订阅一个新的Subscription实例。保证用的数据都是最新的。

说了这么多，其实这只是Provider组件的更新，而不是应用内部某个被connect的组件的更新机制。我猜想应该是考虑到了Provider有可能被嵌套使用，所以会有这种
再Provider更新之后取新数据并重新订阅的做法，这样才能保证每次传给子组件的context是最新的。

### Subscription

我们已经发现了，Provider组件是通过Subscription类中的方法来实现更新的，而过一会要讲到的connect高阶组件的更新，也是通过它来实现，
可见Subscription是React-Redux最核心的更新机制。

```
import { getBatch } from './batch'
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
      // onStateChange会在外部的被实例化成subcription实例的时候，被赋值为不同的更新函数，被赋值的地方分别的Provider和connect中
      // 由于刚刚被订阅的函数就是handleChangeWrapper，而它也就相当于listener。所以当状态变化的时候，listener执行，onStateChange会执行
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
      // 如果parentSub没传，那么使用store订阅，否则，调用parentSub.addNestedSub。具体会在代码下边的解释中说明
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

```

Subscription就是将页面的更新工作和状态的变化联系起来，具体就是listener（触发页面更新的方法，在这里就是handleChangeWrapper）
通过trySubscribe方法，根据情况被分别订阅到store或者Subscription内部。放入到listeners数组，当state变化的时候，listeners循环
执行每一个监听器，触发页面更新。

这里要说一下trySubscribe中根据不同情况判断直接使用store订阅，还是调用addNestedSub来实现内部订阅的原因。因为可能在一个应用中存在
多个store，这里的判断是为了让不同的store订阅自己的listener，互不干扰。

## 如何向组件中注入state和dispatch

我们先思考是什么时候注入的呢？

正常顺序肯定是先拿到store，再以某种方式分别执行这两个函数，将store中的state和dispatch，以及组件自身的
props作为mapStateToProps和mapDispatchToProps的参数，传进去，我们就可以在这两个函数之内能拿到这些值。而它们的返回值，又会再注入到组件的props中。

说到这里，就要引出一个概念：**selector**。最终注入到组件的props是selectorFactory函数生成的selector的返回值。

生成的过程是在connect的核心函数connectAdvanced中，这个时候可以拿到当前context中的store，进而用store传入selectorFactory生成selector，其形式为
```
function selector(stateOrDispatch, ownProps) {
  ...
  return props
}
```
可以看到，selector就相当于mapStateToProps或者mapDispatchToProps，selector的返回值将作为props注入到组件中。

### 从mapToProps到selector
*标题的mapToProps泛指mapStateToProps， mapDispatchToProps， mergeProps*
结合日常的使用可知，我们的组件在被connect包裹之后才能拿到state和dispatch，所以我们先带着上边的结论，单独梳理selector的机制，先看connect的源码：
```
export function createConnect({
  connectHOC = connectAdvanced, // connectAdvanced函数是connect的核心
  mapStateToPropsFactories = defaultMapStateToPropsFactories,
  mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
  mergePropsFactories = defaultMergePropsFactories,
  selectorFactory = defaultSelectorFactory
} = {}) {
  return function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {...options} = {}
  ) {
    // 将我们传入的mapStateToProps， mapDispatchToProps， mergeProps都初始化一遍
    const initMapStateToProps = match(mapStateToProps,
      mapStateToPropsFactories,
      'mapStateToProps')
    const initMapDispatchToProps = match(mapDispatchToProps,
      mapDispatchToPropsFactories,
      'mapDispatchToProps')
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')
    // 返回connectHOC函数的调用
    return connectHOC(selectorFactory, {
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      ...
    })
  }
}

export default createConnect()
```
connect实际上是createConnect，而createConnect也只是返回了一个connect函数，而connect函数返回了connectHOC的调用（也就是connectAdvanced的调用），
而connectAdvanced的调用最终会返回一个wrapWithConnect函数，这个函数的参数是我们传入的组件。所以才有了connect平常的用法：
```
connect(mapStateToProps, mapDispatchToProps)(Component)
```
大家应该注意到了connect函数内将mapStateToProps， mapDispatchToProps， mergeProps都初始化了一遍，为什么要去初始化而不直接使用呢？带着疑问，我们往下看。

### 初始化selector过程
先看代码，主要看initMapStateToProps 和 initMapDispatchToProps，看一下这段代码是什么意思。
```
const initMapStateToProps = match(mapStateToProps,
  mapStateToPropsFactories,
  'mapStateToProps')
const initMapDispatchToProps = match(mapDispatchToProps,
  mapDispatchToPropsFactories,
  'mapDispatchToProps')
const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')
```
mapStateToPropsFactories 和 mapDispatchToPropsFactories都是函数数组，其中的每个函数都会接收一个参数，为mapStateToProps或者mapDispatchToProps。
而match函数的作用就是循环函数数组，mapStateToProps或者mapDispatchToProps作为每个函数的入参去执行，当此时的函数返回值不为假的时候，赋值给左侧。看一下match函数
```
function match(arg, factories, name) {
  // 循环执行factories，这里的factories也就是mapStateToProps和mapDisPatchToProps两个文件中暴露出来的处理函数数组
  for (let i = factories.length - 1; i >= 0; i--) {
    // arg也就是mapStateToProps或者mapDispatchToProps
    const result = factories[i](arg)
    if (result) return result
  }
}
```
match循环的是一个函数数组，下面我们看一下这两个数组，分别是mapStateToPropsFactories 和 mapDispatchToPropsFactories：
（下边源码中的whenMapStateToPropsIsFunction会放到后边讲解）
* mapStateToPropsFactories
  - ```
    import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'
    // 当mapStateToProps是函数的时候，调用wrapMapToPropsFunc
    export function whenMapStateToPropsIsFunction(mapStateToProps) {
      return typeof mapStateToProps === 'function'
        ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
        : undefined
    }
    // 当mapStateToProps没有传的时候，调用wrapMapToPropsConstant
    export function whenMapStateToPropsIsMissing(mapStateToProps) {
      return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined
    }

    export default [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing]
    ```
     现在可以看出来，实际上是让`whenMapStateToPropsIsFunction`和`whenMapStateToPropsIsMissing`
     都去执行一次mapStateToProps，然后根据传入的mapStateToProps的情况来选出有返回值的函数赋值给initMapStateToProps。

     单独看一下whenMapStateToPropsIsMissing
    ```
    export function wrapMapToPropsConstant(getConstant) {
      return function initConstantSelector(dispatch, options) {
        const constant = getConstant(dispatch, options)
        function constantSelector() {
          return constant
        }
        constantSelector.dependsOnOwnProps = false
        return constantSelector
      }
    }
    ```
    wrapMapToPropsConstant返回了一个函数，接收的参数是我们传入的() => ({})，函数内部调用了入参函数并赋值给一个常量放入了constantSelector中，
    该常量实际上就是我们没传mapStateToProps时候的生成的selector，这个selector返回的是空对象，所以不会接受任何来自store中的state。
    同时可以看到constantSelector.dependsOnOwnProps = false，表示返回值与connect高阶组件接收到的props无关。

* mapDispatchToPropsFactories
  - ```
        import { bindActionCreators } from '../../redux-src'
        import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

        export function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
          return typeof mapDispatchToProps === 'function'
            ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')
            : undefined
        }
        // 当不传mapDispatchToProps时，默认向组件中注入dispatch
        export function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
          return !mapDispatchToProps
            ? wrapMapToPropsConstant(dispatch => ({ dispatch }))
            : undefined
        }
        // 当传入的mapDispatchToProps是对象，利用bindActionCreators进行处理  详见redux/bindActionCreators.js
        export function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
          return mapDispatchToProps && typeof mapDispatchToProps === 'object'
            ? wrapMapToPropsConstant(dispatch => bindActionCreators(mapDispatchToProps, dispatch))
            : undefined
        }

        export default [
          whenMapDispatchToPropsIsFunction,
          whenMapDispatchToPropsIsMissing,
          whenMapDispatchToPropsIsObject
        ]
    ```
    没有传递mapDispatchToProps的时候，会调用whenMapDispatchToPropsIsMissing，这个时候，constantSelector只会返回一个dispatch，
    所以只能在组件中接收到dispatch。

    当传入的mapDispatchToProps是对象的时候，也是调用wrapMapToPropsConstant，根据前边的了解，这里注入到组件中的属性是
    bindActionCreators(mapDispatchToProps, dispatch)的执行结果。

现在，让我们看一下whenMapStateToPropsIsFunction这个函数。它是在mapDispatchToProps与mapStateToProps都是函数的时候调用的，实现也比较复杂。
这里只单用mapStateToProps来举例说明。

*下边的mapToProps指的是mapDispatchToProps与mapStateToProps*

```
// 根据mapStateToProps函数的参数个数，判断组件是否应该依赖于自己的props
export function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined
    ? Boolean(mapToProps.dependsOnOwnProps)
    : mapToProps.length !== 1
}

export function wrapMapToPropsFunc(mapToProps, methodName) {
  // 最终wrapMapToPropsFunc返回的是一个proxy函数，返回的函数会在selectorFactory函数中的finalPropsSelectorFactory内被调用并赋值给其他变量。
  // 而这个proxy函数会在selectorFactory中执行，生成最终的selector
  return function initProxySelector(dispatch, { displayName }) {
    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      // 根据组件是否依赖自身的props决定调用的时候传什么参数
      return proxy.dependsOnOwnProps
        ? proxy.mapToProps(stateOrDispatch, ownProps)
        : proxy.mapToProps(stateOrDispatch)
    }
    proxy.dependsOnOwnProps = true
    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      // 将proxy.mapToProps赋值为我们传入的mapToProps
      proxy.mapToProps = mapToProps
      // 根据组件是否传入了组件本身从父组件接收的props来确定是否需要向组件中注入ownProps，最终会用来实现组件自身的props变化，也会调用mapToProps的效果
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps)
      // 再去执行proxy。这时候proxy.mapToProps已经被赋值为我们传进来的mapToProps函数，所以props就会被赋值成传进来的mapToProps的返回值
      let props = proxy(stateOrDispatch, ownProps)
      if (typeof props === 'function') {
        // 如果返回值是函数，那么再去执行这个函数
        proxy.mapToProps = props
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props)
        props = proxy(stateOrDispatch, ownProps)
      }
      if (process.env.NODE_ENV !== 'production')
        verifyPlainObject(props, displayName, methodName)
      return props
    }
    return proxy
  }
}

```

wrapMapToPropsFunc返回的实际上是initProxySelector函数，initProxySelector的执行结果是一个代理proxy，可理解为将state或dispatch代理到组件的props。
proxy的执行结果是proxy.mapToProps，也就是上边提到的selector。

页面初始化执行的时候，dependsOnOwnProps为true，所以执行proxy.mapToProps(stateOrDispatch, ownProps)，也就是detectFactoryAndVerify。
在后续的执行过程中，会先将proxy的mapToProps赋值为我们传入connect的mapStateToProps或者mapDispatchToProps，然后在依照实际情况组件是否应该依赖自己的props赋值给
dependsOnOwnProps。（注意，这个变量会在selectorFactory函数中作为组件是否根据自己的props变化执行mapToProps函数的依据）。

总结一下，这个函数最本质上做的事情就是将我们传入connect的mapToProps函数挂到proxy.mapToProps上，同时再往proxy上挂载一个dependsOnOwnProps来方便区分组件是否依赖
自己的props。最后，proxy.mapToProps作为selector被返回到proxy上，而proxy又被作为initProxySelector的返回值，所以初始化过程被赋值的initMapStateToProps，
initMapDispatchToProps，initMergeProps实际上是initProxySelector的函数引用，它们执行之后是proxy，至于它们三个是在哪执行来生成具体的selector的我们下边会讲到。

现在，回想一下我们的疑问，为什么要去初始化那三个mapToProps函数？目的很明显，就是准备出生成selector的函数，放到一个合适的时机来执行，同时决定selector要不要对ownProps
的改变做反应。

### 创建selector，向组件注入props

准备好了生成selector的函数之后，就需要执行它，将它的返回值作为props注入到组件中了。先粗略的概括一下注入的过程：

* 取到store的state或dispatch，以及ownProps
* 执行selector
* 将执行的返回值注入到组件

下面我们需要从最后一步的注入过程倒推，来看selector是怎么执行的。

注入的过程发生在connect的核心函数connectAdvanced之内，先忽略该函数内的其他过程，聚焦注入过程简单看下源码
```
export default function connectAdvanced(
  selectorFactory,
  {
    getDisplayName = name => `ConnectAdvanced(${name})`,
    methodName = 'connectAdvanced',
    renderCountProp = undefined,
    shouldHandleStateChanges = true,
    storeKey = 'store',
    withRef = false,
    forwardRef = false,
    context = ReactReduxContext,
    ...connectOptions
  } = {}
) {
  const Context = context
  return function wrapWithConnect(WrappedComponent) {

    // ...忽略了其他代码

    // selectorFactoryOptions是包含了我们初始化的mapToProps的一系列参数
    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }
    // pure表示只有当state或者ownProps变动的时候，重新计算生成selector。
    const { pure } = connectOptions

    /* createChildSelector 的调用形式：createChildSelector(store)(state, ownProps)，
       createChildSelector返回了selectorFactory的调用，而selectorFactory实际上是其内部根据options.pure返回的
       impureFinalPropsSelectorFactory 或者是 pureFinalPropsSelectorFactory的调用，而这两个函数需要的参数是
           mapStateToProps,
           mapDispatchToProps,
           mergeProps,
           dispatch,
           options
       除了dispatch，其余参数都可从selectorFactoryOptions中获得。调用的返回值，就是selector。而selector需要的参数是
       (state, ownprops)。所以得出结论，createChildSelector(store)就是selector
    */
    function createChildSelector(store) {
      // 这里是selectorFactory.js中finalPropsSelectorFactory的调用（本质上也就是上面我们初始化的mapToProps的调用），传入dispatch，和options
      return selectorFactory(store.dispatch, selectorFactoryOptions)
    }

    function ConnectFunction(props) {
      const store = props.store || contextValue.store
      // 仅当store变化的时候，创建selector
      // 调用childPropsSelector => childPropsSelector(dispatch, options)
      const childPropsSelector = useMemo(() => {
        // 每当store变化的时候重新创建这个选择器
        return createChildSelector(store)
      }, [store])

      // actualChildProps就是最终要注入到组件中的props，也就是selector的返回值。
      const actualChildProps = usePureOnlyMemo(() => {
        return childPropsSelector(store.getState(), wrapperProps)
      }, [store, previousStateUpdateResult, wrapperProps])

      const renderedWrappedComponent = useMemo(
        // 这里是将props注入到组件的地方
        () => <WrappedComponent {...actualChildProps} />,
        [forwardedRef, WrappedComponent, actualChildProps]
      )
    }
  // 最后return出去
  return hoistStatics(Connect, WrappedComponent)
}
```
在注入过程中，有一个很重要的东西：`selectorFactory`。这个函数就是生成selector的很重要的一环。它起到一个上传下达的作用，把接收到的dispatch，
以及那三个mapToProps函数，传入到selectorFactory内部的处理函数（pureFinalPropsSelectorFactory 或 impureFinalPropsSelectorFactory）中，
selectorFactory的执行结果是内部处理函数的调用。而内部处理函数的执行结果就是将那三种selector（mapStateToProps，mapDispatchToProps，mergeProps）
执行后合并的结果。也就是最终要传给组件的props

下面我们看一下selectorFactory的内部实现。为了清晰，只先一下内部的结构
```
// 直接将mapStateToProps，mapDispatchToProps，ownProps的执行结果合并作为返回值return出去
export function impureFinalPropsSelectorFactory(){}

export function pureFinalPropsSelectorFactory() {
  // 整个过程首次初始化的时候调用
  function handleFirstCall(firstState, firstOwnProps) {}

  // 返回新的props
  function handleNewPropsAndNewState() {
    // 将mapStateToProps，mapDispatchToProps，ownProps的执行结果合并作为返回值return出去
  }

  // 返回新的props
  function handleNewProps() {
    // 将mapStateToProps，mapDispatchToProps，ownProps的执行结果合并作为返回值return出去
  }

  // 返回新的props
  function handleNewState() {
    // 将mapStateToProps，mapDispatchToProps，ownProps的执行结果合并作为返回值return出去
  }

  // 后续的过程调用
  function handleSubsequentCalls(nextState, nextOwnProps) {}

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    // 第一次渲染，调用handleFirstCall，之后的action派发行为会触发handleSubsequentCalls
    return hasRunAtLeastOnce
      ? handleSubsequentCalls(nextState, nextOwnProps)
      : handleFirstCall(nextState, nextOwnProps)
  }
}

// finalPropsSelectorFactory函数是在connectAdvaced函数内调用的selectorFactory函数
export default function finalPropsSelectorFactory(
  dispatch,
  { initMapStateToProps, initMapDispatchToProps, initMergeProps, ...options }
) {
  const mapStateToProps = initMapStateToProps(dispatch, options) // 这里是wrapMapToProps.js中wrapMapToPropsFunc函数的柯里化调用，是改造
  // 之后的mapStateToProps, 在下边返回的函数内还会再调用一次
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options)
  const mergeProps = initMergeProps(dispatch, options)
  // 根据是否传入pure属性，决定调用哪个生成selector的函数来计算传给组件的props。并将匹配到的函数赋值给selectorFactory
  const selectorFactory = options.pure
    ? pureFinalPropsSelectorFactory // 当props或state变化的时候，才去重新计算props
    : impureFinalPropsSelectorFactory // 直接重新计算props

  // 返回selectorFactory的调用
  return selectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
    options
  )
}
```
可以看出来，selectorFactory内部会决定在什么时候生成新的props。下面来看一下完整的源码
```
export function impureFinalPropsSelectorFactory(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  dispatch
) {
  // 直接将三个selector的执行结果合并返回
  return function impureFinalPropsSelector(state, ownProps) {
    return mergeProps(
      mapStateToProps(state, ownProps),
      mapDispatchToProps(dispatch, ownProps),
      ownProps
    )
  }
}

export function pureFinalPropsSelectorFactory(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  dispatch,
  { areStatesEqual, areOwnPropsEqual, areStatePropsEqual }
) {
  // 使用闭包保存一个变量，标记是否是第一次执行
  let hasRunAtLeastOnce = false
  // 下边这些变量用于缓存计算结果
  let state
  let ownProps
  let stateProps
  let dispatchProps
  let mergedProps

  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState
    ownProps = firstOwnProps
    stateProps = mapStateToProps(state, ownProps) // 这里是wrapMapToProps.js中wrapMapToPropsFunc函数的柯里化调用的函数内部的proxy函数的调用。
    /*
    * 膝盖已烂，太绕了
    * 回顾一下proxy:
    *   const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {}
    *   return proxy
    * */
    dispatchProps = mapDispatchToProps(dispatch, ownProps)
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    hasRunAtLeastOnce = true
    // 返回计算后的props
    return mergedProps
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps)
    // 由于这个函数的调用条件是ownProps和state都变化，所以有必要判断一下是dependsOnOwnProps
    // 多说一句，mapDispatchToProps实际上也就是proxy，另外两个mapToProps函数也是
    if (mapDispatchToProps.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps(dispatch, ownProps)

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    return mergedProps
  }

  function handleNewProps() {
    // 判断如果需要依赖组件自己的props，重新计算stateProps
    if (mapStateToProps.dependsOnOwnProps) {
      stateProps = mapStateToProps(state, ownProps)
    }
    // 同上
    if (mapDispatchToProps.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps(dispatch, ownProps)
    // 将组件自己的props，dispatchProps，stateProps整合出来
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    return mergedProps
  }

  function handleNewState() {
    const nextStateProps = mapStateToProps(state, ownProps)
    const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps)
    stateProps = nextStateProps
    // 由于handleNewState执行的大前提是pure为true，所以有必要判断一下前后来自store的state是否变化
    if (statePropsChanged)
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    return mergedProps
  }

  function handleSubsequentCalls(nextState, nextOwnProps) {
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps)
    const stateChanged = !areStatesEqual(nextState, state)
    state = nextState
    ownProps = nextOwnProps
    // 依据不同的情况，调用不同的函数
    if (propsChanged && stateChanged) return handleNewPropsAndNewState()    // 当组件自己的props和注入的store中的某些state同时变化时，调用handleNewPropsAndNewState()获取最新的props
    if (propsChanged) return handleNewProps() // 仅当组件自己的props变化时，调用handleNewProps来获取最新的props，此时的props包括注入的props，组件自身的props，和dpspatch内的函数
    if (stateChanged) return handleNewState() // 仅当注入的store中的某些state变化时，调用handleNewState()获取最新的props, 此时的props包括注入的props，组件自身的props，和dpspatch内的函数
    // 如果都没变化，直接返回先前缓存的mergedProps，并且在以上三个函数中，都分别用闭包机制对数据做了缓存
    return mergedProps
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    // 第一次渲染，调用handleFirstCall，之后的action派发行为会触发handleSubsequentCalls
    return hasRunAtLeastOnce
      ? handleSubsequentCalls(nextState, nextOwnProps)
      : handleFirstCall(nextState, nextOwnProps)
  }
}

export default function finalPropsSelectorFactory(
  dispatch,
  { initMapStateToProps, initMapDispatchToProps, initMergeProps, ...options }
) {
  const mapStateToProps = initMapStateToProps(dispatch, options) // 这里是wrapMapToProps.js中wrapMapToPropsFunc函数的柯里化调用，是改造
  // 之后的mapStateToProps, 在下边返回的函数内还会再调用一次
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options)
  const mergeProps = initMergeProps(dispatch, options)
  // 验证mapToProps函数，有错误时给出提醒
  if (process.env.NODE_ENV !== 'production') {
    verifySubselectors(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options.displayName
    )
  }
  // 根据是否传入了pure，决定计算新props的方式，默认为true
  const selectorFactory = options.pure
    ? pureFinalPropsSelectorFactory
    : impureFinalPropsSelectorFactory

  return selectorFactory(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
    options
  )
}
```

至此，我们搞明白了mapToProps函数是在什么时候执行的。再来回顾一下这部分的问题：**如何向组件中注入state和dispatch**，让我们从头梳理一下：

**传入mapToProps**

首先，在connect的时候传入了mapStateToProps，mapDispatchToProps，mergeProps。再联想一下用法，这些函数内部可以接收到state或dispatch，以及ownProps，它们的返回值
会传入组件的props。

**基于mapToProps生成selector**

但需要根据ownProps决定是否要依据其变化重新计算这些函数的返回值，所以会以这些函数为基础，生成代理函数（proxy），代理函数的执行结果就是selector，上边挂载了
dependsOnOwnProps属性，所以在selectorFactory内真正执行的时候，才有何时才去重新计算的依据。

**将selector的执行结果作为props传入组件**

这一步在connectAdvanced函数内，创建一个调用selectorFactory，将store以及我们初始化后的mapToProps函数和其他配置传进去。selectorFactory内执行mapToProps，返回
应该传给组件的props，最后将这些props传入组件。

**大功告成**

## React-Redux的更新机制
React-Redux的更新机制也是属于订阅发布的模式。而且与Redux类似，一旦状态发生变化，调用listener更新页面。让我们根据这个过程抓取关键点：
* 更新谁？
* 订阅的更新函数是什么？
* 如何判断状态变化？
不着急看代码，我觉得先用文字描述清楚这些关键问题，不再一头雾水地看代码更容易让大家理解。

**更新谁？**

回想一下平时使用React-Redux的时候，是不是只有被connect过并且传入了mapStateToProps的组件，会响应store的变化？
所以，被更新的是被connect过的组件，而connect返回的是connectAdvanced，并且并且connectAdvanced会返回我们传入的组件，
所以本质上是connectAdvanced内部依据store的变化更新自身，进而达到更新真正组件的目的，


**订阅的更新函数是什么？**
这一点从connectAdvanced内部订阅的时候可以很直观地看出来：
```
subscription.onStateChange = checkForUpdates
subscription.trySubscribe()
```
重要的是这个checkForUpdates做了什么，能让组件更新。在connectAdvanced中使用useReducer内置了一个reducer，这个函数做的事情就是在前置条件（状态变化）成立的时候，
dispatch一个action，来触发更新。


**如何判断状态变化？**
这个问题很好理解，因为每次redux返回的都是一个新的state。直接判断前后的state的引用是否相同，就可以了

### connect核心--connectAdvanced
connectAdvanced是一个比较重量级的高阶函数，上边大致说了更新机制，但很多具体做法都是在connectAdvanced中实现的。源码很长，逻辑有一些复杂，我写了详细的注释。
看的过程需要思考函数之间的调用的目的，每个变量的意义，带着上边的结论，相信不难看懂，加油！
```
// 这是保留组件的静态方法
import hoistStatics from 'hoist-non-react-statics'
import React, {
  useContext,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useReducer
} from 'react'
import { isValidElementType, isContextConsumer } from 'react-is'
import Subscription from '../utils/Subscription'

import { ReactReduxContext } from './Context'

const EMPTY_ARRAY = []
const NO_SUBSCRIPTION_ARRAY = [null, null]

// 内置的reducer
function storeStateUpdatesReducer(state, action) {
  const [, updateCount] = state
  return [action.payload, updateCount + 1]
}

const initStateUpdates = () => [null, 0]

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect because we want
// `connect` to perform sync updates to a ref to save the latest props after
// a render is actually committed to the DOM.
// 自己对于以上英文注释的意译：
// 当在服务端环境使用useLayoutEffect时候，react会发出警告，为了解决此问题，需要在服务端使用useEffect，浏览器端使用useLayoutEffect。
// useLayoutEffect会在所有的DOM变更之后同步调用传入其中的回调（effect），
// 所以在浏览器环境下需要使用它，因为connect将会在渲染被提交到DOM之后，再同步更新ref来保存最新的props

// ReactHooks文档对useLayoutEffect的说明：在浏览器执行绘制之前，useLayoutEffect 内部的更新计划将被同步刷新。

// useEffect的effect将在每轮渲染结束后执行，useLayoutEffect的effect在dom变更之后，绘制之前执行。
// 这里的effect做的是更新工作
// 有可能，在服务端渲染的时候页面已经出来了，js还未加载完成。
// 所以需要在SSR阶段使用useEffect，保证在页面由js接管后，如果需要更新了，再去更新。
// 而在浏览器环境则不存在这样的问题

// 根据是否存在window确定是服务端还是浏览器端
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function connectAdvanced(
  selectorFactory,
  // options object:
  {
    // 获取被connect包裹之后的组件名
    getDisplayName = name => `ConnectAdvanced(${name})`,

    // 为了报错信息的占卜师
    methodName = 'connectAdvanced',

    // 直接翻译了：如果被定义, 名为此值的属性将添加到传递给被包裹组件的 props 中。它的值将是组件被渲染的次数，这对于跟踪不必要的重新渲染非常有用。默认值: undefined
    renderCountProp = undefined,

    // connect组件是否应响应store的变化
    shouldHandleStateChanges = true,

    // 使用了多个store的时候才需要用这个，目的是为了区分该获取哪个store
    storeKey = 'store',

    // 如果为 true，则将一个引用存储到被包裹的组件实例中，
    // 并通过 getWrappedInstance()获取到。
    withRef = false,
    // 用于将ref传递进来
    forwardRef = false,

    // 组件内部使用的context，用户可自定义
    context = ReactReduxContext,

    // 其余的配置项，selectorFactory应该会用到
    ...connectOptions
  } = {}
) {
  //省略了一些报错的逻辑

  // 获取context
  const Context = context

  return function wrapWithConnect(WrappedComponent) {

    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = getDisplayName(wrappedComponentName)

    // 定义selectorFactoryOptions，为构造selector做准备
    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }
    const { pure } = connectOptions
   /* 调用createChildSelector => createChildSelector(store)(state, ownProps)
     createChildSelector返回了selectorFactory的带参调用，而selectorFactory实际上是其内部根据options.pure返回的
     impureFinalPropsSelectorFactory 或者是 pureFinalPropsSelectorFactory的调用，而这两个函数需要的参数是(state, ownProps)
    */
    function createChildSelector(store) {
      // 这里是selectorFactory.js中finalPropsSelectorFactory的调用，传入dispatch，和options
      return selectorFactory(store.dispatch, selectorFactoryOptions)
    }

    // 根据是否是pure模式来决定是否需要对更新的方式做优化，pure在这里的意义类似于React的PureComponent
    const usePureOnlyMemo = pure ? useMemo : callback => callback()

    function ConnectFunction(props) {
      // props变化，获取最新的context,forwardedRef以及组件其他props
      const [propsContext, forwardedRef, wrapperProps] = useMemo(() => {
        const { context, forwardedRef, ...wrapperProps } = props
        return [context, forwardedRef, wrapperProps]
      }, [props])
      // propsContext或Context发生变化，决定使用哪个context，如果propsContext存在则优先使用
      const ContextToUse = useMemo(() => {
        // 用户可能会用自定义的context来代替ReactReduxContext，缓存住我们应该用哪个context实例
        // Users may optionally pass in a custom context instance to use instead of our ReactReduxContext.
        // Memoize the check that determines which context instance we should use.
        return propsContext &&
          propsContext.Consumer &&
          isContextConsumer(<propsContext.Consumer />)
          ? propsContext
          : Context
      }, [propsContext, Context])

      // Retrieve the store and ancestor subscription via context, if available
      // 通过上层组件获取上下文中的store
      // 当上层组件最近的context变化的时候，返回该context的当前值，也就是store
      const contextValue = useContext(ContextToUse)
      // The store _must_ exist as either a prop or in context
      // store必须存在于prop或者context中
      // 判断store是否是来自props中的store
      const didStoreComeFromProps = Boolean(props.store)
      // 判断store是否是来自context中的store
      const didStoreComeFromContext =
        Boolean(contextValue) && Boolean(contextValue.store)

      // 从context中取出store，这样也就达到了跨组件通信的目的。优先使用props中的store
      const store = props.store || contextValue.store
      // 仅当store变化的时候，创建selector
      // 调用childPropsSelector => childPropsSelector(dispatch, options)
      const childPropsSelector = useMemo(() => {
        // selector的创建需要依赖于传入store
        // 每当store变化的时候重新创建这个selector
        return createChildSelector(store)
      }, [store])

      const [subscription, notifyNestedSubs] = useMemo(() => {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY
        // Subscription订阅的东西应来自于context,一个通过props被连接到store的组件不应该用来自context的subscription
        // 也就是说
        // This Subscription's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        const subscription = new Subscription(
          store,
          didStoreComeFromProps ? null : contextValue.subscription
        )
        const notifyNestedSubs = subscription.notifyNestedSubs.bind(
          subscription
        )

        return [subscription, notifyNestedSubs]
      }, [store, didStoreComeFromProps, contextValue])
      // contextValue就是store，将store重新覆盖一遍，注入subscription，这样被connect的组件在context中可以拿到subscription
      const overriddenContextValue = useMemo(() => {
        if (didStoreComeFromProps) {
          // 如果组件是直接订阅到来自props中的store，就直接使用来自props中的context
          return contextValue
        }

        // Otherwise, put this component's subscription instance into context, so that
        // connected descendants won't update until after this component is done
        // 意译：
        // 如果store是从context获取的，那么将subscription放入上下文，
        // 为了保证在component更新完毕之前被connect的子组件不会更新
        return {
          ...contextValue,
          subscription
        }
      }, [didStoreComeFromProps, contextValue, subscription])

      // 内置reducer，来使组件更新，在checkForUpdates函数中会用到，作为更新机制的核心
      const [
        [previousStateUpdateResult],
        forceComponentUpdateDispatch
      ] = useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates)

      if (previousStateUpdateResult && previousStateUpdateResult.error) {
        throw previousStateUpdateResult.error
      }

      // Set up refs to coordinate values between the subscription effect and the render logic
      /*
      * 官方解释：
      * useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。
      * 返回的 ref 对象在组件的整个生命周期内保持不变。
      *
      * ref不仅用于DOM，useRef()的current属性可以用来保存值，类似于类的实例属性
      *
      * */
      const lastChildProps = useRef() // 组件的props，包括来自父级的，store，dispatch
      const lastWrapperProps = useRef(wrapperProps) // 组件本身来自父组件的props
      const childPropsFromStoreUpdate = useRef() // 标记来自store的props是否被更新了
      const renderIsScheduled = useRef(false) // 标记更新的时机
      /*
      * actualChildProps是真正要注入到组件中的props
      * */
      const actualChildProps = usePureOnlyMemo(() => {
        // Tricky logic here:
        // - This render may have been triggered by a Redux store update that produced new child props
        // - However, we may have gotten new wrapper props after that
        // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
        // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
        // So, we'll use the child props from store update only if the wrapper props are the same as last time.
        /*
        * 意译：
        * 这个渲染将会在store的更新产生新的props时候被触发，然而，我们可能会在这之后接收到来自父组件的新的props，如果有新的props，
        * 但来自父组件的props不变，我们应该依据新的child props来更新。但是来自父组件的props更新也会导致整体props的改变，所以不得不重新计算。
        * 所以只在新的props改变并且来自父组件的props和上次一致的情况下，才去更新
        *
        * 也就是说只依赖于store变动引起的props更新来重新渲染
        * */
        if (
          childPropsFromStoreUpdate.current &&
          wrapperProps === lastWrapperProps.current
        ) {
          return childPropsFromStoreUpdate.current
        }
        return childPropsSelector(store.getState(), wrapperProps)
      }, [store, previousStateUpdateResult, wrapperProps])
      // We need this to execute synchronously every time we re-render. However, React warns
      // about useLayoutEffect in SSR, so we try to detect environment and fall back to
      // just useEffect instead to avoid the warning, since neither will run anyway.
      /*
      * 意译：我们需要在每次重新渲染的时候同步执行这个effect。但是react将会在SSR的情况放下对于useLayoutEffect做出警告，
      * 所以useIsomorphicLayoutEffect的最终结果是通过环境判断得出的useEffect或useLayoutEffect。在服务端渲染的时候使用useEffect，
      * 因为在这种情况下useEffect会等到js接管页面以后再去执行，所以就没有warning了
      * */
      /*
      * 上下有两个useIsomorphicLayoutEffect，不同之处在于它们两个的执行时机。
      *
      * 第一个没有传入依赖项数组，所以会在每次重新渲染的时候执行，负责每次重新渲染的
      * 时候检查来自store的数据有没有变化，变化就通知listeners去更新
      *
      * 第二个依赖于store, subscription, childPropsSelector。所以在这三个变化的时候，回去执行effect。
      * 其内部的effect做的事情有别于另一个，负责定义更新函数checkForUpdates、订阅更新函数，便于在第一个响应store更新的时候，
      * 可以将更新函数作为listener执行，来达到更新页面的目的
      *
      * */

      useIsomorphicLayoutEffect(() => {
        lastWrapperProps.current = wrapperProps // 获取到组件自己的props
        lastChildProps.current = actualChildProps // 获取到注入到组件的props
        renderIsScheduled.current = false // 表明已经过了渲染阶段
        // If the render was from a store update, clear out that reference and cascade the subscriber update
        // 如果来自store的props更新了，那么通知listeners去执行，也就是执行先前被订阅的this.handleChangeWrapper（Subscription类中），
        // handleChangeWrapper中调用的是onStateChange，也就是在下边赋值的负责更新页面的函数checkForUpdates
        if (childPropsFromStoreUpdate.current) {
          childPropsFromStoreUpdate.current = null
          notifyNestedSubs()
        }
      })

      // Our re-subscribe logic only runs when the store/subscription setup changes
      // 重新订阅仅在store内的subscription变化时才会执行。这两个变化了，也就意味着要重新订阅，因为之前的订阅已经没有意义了
      useIsomorphicLayoutEffect(() => {
        // 如果没有订阅，直接return，shouldHandleStateChanges默认为true，所以默认情况会继续执行
        if (!shouldHandleStateChanges) return

        // Capture values for checking if and when this component unmounts
        // 当组件卸载的时候，用闭包，声明两个变量标记是否被取消订阅和错误对象
        let didUnsubscribe = false
        let lastThrownError = null

        // 当store或者subscription变化的时候，回调会被重新执行，从而实现重新订阅
        const checkForUpdates = () => {
          if (didUnsubscribe) {
            // 如果取消订阅了，那啥都不做
            return
          }
          // 获取到最新的state
          const latestStoreState = store.getState()

          let newChildProps, error
          try {
            // 使用selector获取到最新的props
            newChildProps = childPropsSelector(
              latestStoreState,
              lastWrapperProps.current
            )
          } catch (e) {
            error = e
            lastThrownError = e
          }

          if (!error) {
            lastThrownError = null
          }

          // 如果props没变化，只通知一下listeners更新
          if (newChildProps === lastChildProps.current) {
            /*
            * 浏览器环境下，useLayoutEffect的执行时机是DOM变更之后，绘制之前。
            * 由于上边的useIsomorphicLayoutEffect在这个时机执行将renderIsScheduled.current设置为false，
            * 所以会走到判断内部，保证在正确的时机触发更新
            *
            * */
            if (!renderIsScheduled.current) {
              notifyNestedSubs()
            }
          } else {
            /*
            * 如果props有变化，将新的props缓存起来，并且将childPropsFromStoreUpdate.current设置为新的props，便于在第一个
            * useIsomorphicLayoutEffect执行的时候能够识别出props确实是更新了
            * */
            lastChildProps.current = newChildProps
            childPropsFromStoreUpdate.current = newChildProps
            renderIsScheduled.current = true
            // 当dispatch 内置的action时候，ConnectFunction这个组件会更新，从而达到更新组件的目的
            forceComponentUpdateDispatch({
              type: 'STORE_UPDATED',
              payload: {
                latestStoreState,
                error
              }
            })
          }
        }

        // onStateChange的角色也就是listener。在provider中，赋值为更新listeners。在ConnectFunction中赋值为checkForUpdates
        // 而checkForUpdates做的工作就是根据props的变化，相当于listener，更新ConnectFunction自身
        subscription.onStateChange = checkForUpdates
        subscription.trySubscribe()

        // 第一次渲染后先执行一次，从store中同步数据
        checkForUpdates()
        // 返回一个取消订阅的函数，目的是在组件卸载时取消订阅
        const unsubscribeWrapper = () => {
          didUnsubscribe = true
          subscription.tryUnsubscribe()
          if (lastThrownError) {
            throw lastThrownError
          }
        }

        return unsubscribeWrapper
      }, [store, subscription, childPropsSelector])

      // 将组件的props注入到我们传入的真实组件中
      const renderedWrappedComponent = useMemo(
        () => <WrappedComponent {...actualChildProps} ref={forwardedRef} />,
        [forwardedRef, WrappedComponent, actualChildProps]
      )

      const renderedChild = useMemo(() => {
        if (shouldHandleStateChanges) {
          // If this component is subscribed to store updates, we need to pass its own
          // subscription instance down to our descendants. That means rendering the same
          // Context instance, and putting a different value into the context.
          /*
          * 意译：
            如果这个组件订阅了store的更新，就需要把它自己订阅的实例往下传，也就意味这其自身与其后代组件都会渲染同一个Context实例，
            只不过可能会向context中放入不同的值

            再套一层Provider，将被重写的context放入value。
            这是什么意思呢？也就是说，有一个被connect的组件，又嵌套了一个被connect的组件，保证这两个从context中获取的subscription
            是同一个，而它们可能都会往context中新增加值，我加了一个，我的子组件也加了一个。最终的context是所有组件的value的整合，而
            subscription是一个
          * */
          return (
            <ContextToUse.Provider value={overriddenContextValue}>
              {renderedWrappedComponent}
            </ContextToUse.Provider>
          )
        }
        // 依赖于接收到的context，传入的组件，context的value的变化来决定是否重新渲染
        return renderedWrappedComponent
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue])

      return renderedChild
    }

    // 不用多说，根据pure决定渲染逻辑
    const Connect = pure ? React.memo(ConnectFunction) : ConnectFunction

    // 添加组件名
    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = displayName

    // 如果forwardRef为true，将ref注入到Connect组件，便于获取到组件的DOM实例
    if (forwardRef) {
      const forwarded = React.forwardRef(function forwardConnectRef(
        props,
        ref
      ) {
        return <Connect {...props} forwardedRef={ref} />
      })

      forwarded.displayName = displayName
      forwarded.WrappedComponent = WrappedComponent
      return hoistStatics(forwarded, WrappedComponent)
    }
    // 保留组件的静态方法
    return hoistStatics(Connect, WrappedComponent)
  }
}

```

看完了源码，我们整体概括一下React-Redux中被connect的组件的更新机制：
这其中有三个要素必不可少：
* 根据谁变化（store）
* 更新函数（checkForUpdates）
* 将store和更新函数建立联系的Subscription

connectAdvanced函数内从context中获取`store`，再获取`subscription`实例（可能来自context或新创建），然后创建更新函数`checkForUpdates`，
当组件初始化，或者store、Subscription实例、selector变化的时候，订阅或者重新订阅。在每次组件更新的时候，检查一下store是否变化，有变化则通知更新，
实际上执行checkForUpdates，本质上调用内置reducer更新组件。每次更新导致selector重新计算，所以组件总是能获取到最新的props。所以说，更新机制的最底层
是通过connectAdvanced内置的Reducer来实现的。

## 总结
至此，围绕常用的功能，React-Redux的源码就解读完了。回到文章最开始的三个问题：

* Provider是怎么把store放入context中的
* 如何将store中的state和dispatch(或者调用dispatch的函数)注入组件的props中的
* 我们都知道在Redux中，可以通过store.subscribe()订阅一个更新页面的函数，来实现store变化，更新UI，而React-Redux是如何做到
store变化，被connect的组件也会更新的

现在我们应该可以明白，这三个问题对应着React-Redux的三个核心概念：
* Provider将数据由顶层注入
* Selector生成组件的props
* React-Redux的更新机制

它们协同工作也就是React-Redux的运行机制。阅读源码一定要先确定问题，有目的性的去读。开始的时候我就是硬看，越看越懵，换了一种方式后收获了不少，相信你也是。









