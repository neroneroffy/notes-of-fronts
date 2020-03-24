# 扯一扯Redux的源码
前几天写了一篇react另一个状态管理工具`Unstated`的[源码解析](https://segmentfault.com/a/1190000018795861)。
开启了我的看源码之路。想一想用了好长时间的redux，但从没有深究过原理，遇到报错更是懵逼，所以就啃了一遍它的源码，写了这篇文章，
分享我对于它的理解。

## API概览
看一下redux源码的index.js，看到了我们最常用的几个API：
*  createStore
*  combineReducers
*  bindActionCreators
*  applyMiddleware
*  compose

不着急分析，我们先看一下Redux的基本用法：

```
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
const root = document.getElementById('root')

// reducer 纯函数
const reducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

// 创建一个store
const store = createStore(reducer)

const render = () => ReactDOM.render(
    <div>
      <span>{store.getState()}</span>
      <button onClick=={() => store.dispatch({ type: 'INCREMENT' })}>INCREMENT</button>
      <button onClick=={() => store.dispatch({ type: 'DECREMENT' })}>DECREMENT</button>
    </div>,
    root
)
render()
// store订阅一个更新函数，待dispatch之后，执行这个更新函数，获取新的值
store.subscribe(render)
```
这里实现的是一个点击按钮加减数字的效果，点击触发的行为，与展示在页面上的数字变化，都是通过redux进行的。我们通过这个例子来分析一下redux是怎么工作的：
* 使用reducer创建一个store，便于我们通过store来与redux沟通
* 页面上通过`store.getState()`拿到了当前的数字，初始值为0（在reducer中）
* store.subscribe(render)，订阅更新页面的函数，在reducer返回新的值时，调用。（实际subscribe会把函数推入listeners数组，在之后循环调用）
* 点击按钮，告诉redux，我是要增加还是减少（调用dispatch，传入action）
* 调用dispatch之后，dispatch函数内部会调用我们定义的reducer，结合当前的state，和action，返回新的state
* 返回新的state之后，调用subscribe订阅的更新函数，更新页面
目前为止，我们所有的操作都是通过store进行的，而store是通过createStore创建的，那么我们来看一下它内部的逻辑
## createStore

createStore总共接收三个参数：`reducer`, `preloadedState`, `enhancer`，
* reducer：一个纯函数，接收上一个(或初始的)state，和action，根据action 的type返回新的state
* preloadedState：一个初始化的state，可以设置store中的默认值，
* enhancer：增强器，用来扩展store的功能

暴露给我们几个常用的API：
* dispatch：一个纯函数，接收上一个(或初始的)state，和action，根据action 的type返回新的state
* subscribe：一个初始化的state，可以设置store中的默认值，
* getState：获取store中的状态

我们先通过接收的参数和暴露出来的api梳理一下它的机制：

首先是接收上面提到的三个参数创建一个store，store是存储应用所有状态的地方。同时暴露出三个方法，UI可以通过store.getState()获取到store中的数据，
store.subscribe()，作用是让store订阅一个更新UI的函数，将这个函数push到listeners数组中，等待执行。
store.dispatch()是更新store中数据的唯一方法，dispatch被调用后，首先会调用reducer，根据当前的state和action返回新的状态。然后循环调用listeners中的更新函数，
更新函数一般是我们UI的渲染函数，函数内部会调用store.getState()来获取数据，所以页面会更新。

看一下createStore函数的结构
```
createStore(reducer, preloadedState, enhancer) {
  // 转换参数
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  function getState() {
    // 返回当前的state， 可以调用store.getState()获取到store中的数据，
    ...
  }

  function subscribe(listener) {
    // 订阅一个更新函数（listener），实际上的订阅操作就是把listener放入一个listeners数组
    // 然后再取消订阅，将更新函数从listeners数组内删除
    // 但是注意，这两个操作都是在dispatch不执行时候进行的。因为dispatch执行时候会循环执行更新函数，要保证listeners数组在这时候不能被改变
    ...
  }

  function dispatch(action) {
    // 接收action，调用reducer根据action和当前的state，返回一个新的state
    // 循环调用listeners数组，执行更新函数，函数内部会通过store.getState()获取state，此时的state为最新的state，完成页面的更新
    ...
  }

  return {
    dispatch,
    subscribe,
    getState,
  }

}
```

结构就是这样，但是是如何串联起来的呢？下面来看一下完整的代码（删除了一些）

```
createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    // 有了这一层判断，我们就可以这样传：createStore(reducer, initialState, enhancer)
    // 或者这样： createStore(reducer, enhancer)，其中enhancer还会是enhancer。
    enhancer = preloadedState
    preloadedState = undefined
  }
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    // enhancer的作用是扩展store，所以传入createStore来改造，
    // 再传入reducer, preloadedState生成改造后的store，这一有一点递归调用的意思
    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer // 当前的reducer，还会有新的reducer
  let currentState = preloadedState // 当前的state
  let currentListeners = [] // 存储更新函数的数组
  let nextListeners = currentListeners // 下次dispatch将会触发的更新函数数组
  let isDispatching = false //类似一把锁，如果正在dispatch action，那么就做一些限制

  // 这个函数的作用是判断nextListeners 和 currentListeners是否是同一个引用，是的话就拷贝一份，避免修改各自相互影响
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  function getState() {
    // 正在执行reducer的时候，是不能获取state的，要等到reducer执行完，返回新的state才可以获取
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }
    // 由于dispatch函数会在reducer执行完毕后循环执行listeners数组内订阅的更新函数，所以要保证这个时候的listeners数组
    // 不变，既不能添加（subscribe）更新函数也不能删除（unsubscribe）更新函数
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    // 将更新函数推入到listeners数组，实现订阅
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }
     if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
        )
      }

      isSubscribed = false
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      // 取消订阅
      nextListeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }
    // 正在dispatch的话不能再次dispatch，也就是说不可以同时dispatch两个action
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 获取到当前的state
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = (currentListeners = nextListeners)
    // 循环执行当前的linstener
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
    return action
  }

  // dispatch一个初始的action，作用是不命中你reducer中写的任何关于action的判断，直接返回初始的state
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    // observable  replaceReducer和$$observable主要面向库开发者，这里先不做解析
    // replaceReducer,
    // [$$observable]:
  }
}
```



## combineReducers
combineReducers用于将多个reducer合并为一个总的reducer，所以可以猜出来，
它最终返回的一定是一个函数，并且形式就是一般的reducer的形式，接收state和action，
返回状态:
```
function combine(state, action) {
  ......
  return state
}
```

来看一下核心代码：
```
export default function combineReducers(reducers) {
  // 获取到所有reducer的名字，组成数组
  const reducerKeys = Object.keys(reducers)

  // 这个finalReducers 是最终的有效的reducers
  const finalReducers = {}
  // 以reducer名为key，reducer处理函数为key，生成finalReducers对象，形式如下
  /* {
  *     reducerName1: f,
  *     reducerName2: f
  *  }
  */
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }

  const finalReducerKeys = Object.keys(finalReducers)
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError

  // assertReducerShape用来检查这每个reducer有没有默认返回的state，
  // 我们在写reducer时候，都是要在switch中加一个default的，来默认返回初始状态
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  // 这个函数，就是上边说的返回的最后的那个终极reducer，传入createStore，
  // 然后在dispatch中调用，也就是currentReducer
  // 这个函数的核心是根据finalReducer中存储的所有reducer信息，循环，获取到每个reducer对应的state，
  // 并依据当前dispatch的action，一起传入当前循环到的reducer，生成新的state，最终，将所有新生成的
  // state作为值，各自的reducerName为键，生成最终的state，就是我们在reduxDevTool中看到的state树，形式如下：
    /* {
    *     reducerName1: {
    *       key: 'value'
    *     },
    *     reducerName2: {
    *       key: 'value'
    *     },
    *  }
    */
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }
    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    // 存放最终的所有的state
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      // 获取每个reducer的名字
      const key = finalReducerKeys[i]
      // 获取每个reducer
      const reducer = finalReducers[key]
      // 获取每个reducer的旧状态
      const previousStateForKey = state[key]
      // 调用该reducer，根据这个reducer的旧状态，和当前action来生成新的state
      const nextStateForKey = reducer(previousStateForKey, action)
      // 以各自的reducerName为键，新生成的state作为值，生成最终的state object，
      nextState[key] = nextStateForKey
      // 判断所有的state变化没变化
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // 变化了，返回新的state，否则，返回旧的state
    return hasChanged ? nextState : state
  }
}
```

## applyMiddleware

redux原本的dispatch方法只能接受一个对象作为action

> 用户操作 -> dispatch(action) -> reducer(prevState, action) -> 新的state -> 界面

这么直接干脆的操作固然好，可以让每一步的操作可追踪，方便定位问题，但是带来一个坏处，比如，页面需要发请求获取数据，并且把数据放到action里面，
最终通过reducer的处理，放到store中。这时，如何做呢？

> 用户操作 -> dispatch(`action`) -> middleware(`action`) -> 真正的action -> reducer(prevState, action) -> 新的state -> 界面

重点在于dispatch(`action`) -> middleware(`action`) 这个操作，这里的`action`可以是一个函数，在函数内我们就可以进行很多操作，包括调用API，
然后在调用API成功后，再dispatch真正的action。想要这么做，那就是需要扩展redux，也就是使用增强器：enhancer：
```
const store = createStore(rootReducer,
  applyMiddleware(thunk),
)
```
`applyMiddleware(thunk)`就相当于一个enhancer，它要去扩展store，那么就要接收createStore函数为参数，返回的函数再根据传入的reducer和state，创建store，
来改变这个store中的dispatch方法。再将改造好的dispatch方法替换进store，就完事了。回顾一下createStore中的这部分：
```
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }
```

接下来我们看一下到底是如何改造的。
要了解redux中间件的机制，必须要理解中间件是怎么运行的。看一下redux-thunk，先来了解用不用它有什么区别

一般情况下，dispatch的action是一个纯对象
```
store.dispatch({
    type:'EXPMALE_TYPE',
    payload: {
        name:'123',
    }
})
```
使用了thunk之后，action可以是函数的形式
```
function loadData() {
    return (dispatch, getState) => { // 函数之内会真正dispatch action
        callApi('/url').then(res => {
            dispatch({
                type:'LOAD_SUCCESS',
                data: res.data
            })
        })
    }
}

store.dispatch(loadData()) //派发一个函数
```
一般情况下，dispatch一个函数会直接报错的，因为createStore中的dispatch方法内部判断了action的类型。redux-thunk帮我们做的事就是改造dispatch，让它可以dispatch一个函数。
看一下redux-thunk的核心代码：
```
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
}
const thunk = createThunkMiddleware();
```
这里的三个箭头函数是函数的柯里化，真正调用的时候，理论上是这样thunk({ dispatch, getState })(next)(action)。
其中，thunk({ dispatch, getState })(next)这部分，相当于改造过后的dispatch，而这部分会在applyMiddleware中去调用，
然后从左往右看，{ dispatch, getState }是当前store的dispatch和getState方法，是最原始的，便于在经过中间件处理之后，可以拿到最原始的dispatch去派发真正的action。
next则是被当前中间件改造之前的dispatch。注意这个next，他与前边的dispatch并不一样，next是被thunk改造之前的dispatch，也就是说有可能是最原始的dispatch，
也有可能是被其他中间件改造过的dispatch。

为了更好理解，还是翻译成普通函数嵌套加注释吧
```
function createThunkMiddleware(extraArgument) {
  return function({ dispatch, getState }) { //真正的中间件函数，内部的改造dispatch的函数是精髓
    return function(next) { //改造dispatch的函数，这里的next是外部传进来的dispatch，可能是被其他中间件处理过的，也可能是最原本的
      return function(action) { //这个函数就是改造过后的dispatch函数
        if (typeof action === 'function') {
          // 如果action是函数，那么执行它，并且将store的dispatch和getState传入，便于我们dispatch的函数内部逻辑执行完之后dispatch真正的action,
          // 如上边示例的请求成功后，dispatch的部分
          return action(dispatch, getState, extraArgument);
        }
        // 否则说明是个普通的action，直接dispatch
        return next(action);
      }
    }
  }
}
const thunk = createThunkMiddleware();
```

`extraArgument`这个参数不是特别重要的，一般是传入一个实例，然后在我们需要在真正dispatch的时候需要这个参数的时候可以获取到，比如传入一个axios 的Instance，
那么在请求时候就可以直接用这个instance去请求了

```
import axiosInstance from '../request'
const store = createStore(rootReducer, applyMiddleware(thunk.withExtraArgument(axiosInstance)))

function loadData() {
    return (dispatch, getState, instance) => {
        instance.get('/url').then(res => {
            dispatch({
                type:'LOAD_SUCCESS',
                data: res.data
            })
        })
    }
}

store.dispatch(loadData())

```

来总结一下，
* 中间件和redux的applyMiddleware的关系。中间件（middleware）会帮我们改造原来store的dispatch方法
* 而applyMiddleware会将改造好的dispatch方法应用到store上（相当于将原来的dispatch替换为改造好的dispatch）
理解中间件的原理是理解applyMiddleware机制的前提

## 总结
到这里，redux几个比较核心的概念就讲解完了，不得不说写的真简洁，函数之间的依赖关系让我一度十分懵逼，要理解它还是要用源码来跑一遍例子，
一遍一遍地看。

总结一下redux就是创建一个store来管理所有状态，触发action来改变store。关于redux的使用场景是非常灵活的，可以结合各种库去用，我用惯了react，用的时候还要配合react-redux。



