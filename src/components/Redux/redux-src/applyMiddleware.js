import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => {
      return middleware(middlewareAPI)
    })
    dispatch = compose(...chain)(store.dispatch)
    /*
    * 这里的compose函数的作用就是，将所有的中间件函数串联起来，中间件1结束，作为参数传入中间件2，被它处理，
    * 以此类推最终返回的是被所有中间件处理完的函数，接收dispatch函数为参数，改造成新的dispatch函数，处理action。
    *
    * 先看最简单的情况：假设我们只使用了一个middleware（redux-thunk），就可以暂时抛开compose，那么这里的逻辑就相当于
    * dispatch = thunk(middlewareAPI)(store.dispatch)
    * 是不是有点熟悉？ 在redux-thunk源码中我们分析过：
    * ---------------
    * 真正调用thunk的时候，thunk({ dispatch, getState })(next)(action)
    * 其中，thunk({ dispatch, getState })(next)这部分，相当于改造过后的dispatch，而这部分会在applyMiddleware中去调用，
    * ---------------
    * 所以，这里就将store的dispatch方法改造完成了，最后用改造好的dispatch覆盖原来store中的dispatch
    *
    * */

    return {
      ...store,
      dispatch
    }
  }
}
