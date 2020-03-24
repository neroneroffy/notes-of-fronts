import hoistStatics from 'hoist-non-react-statics'
import invariant from 'invariant'
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

// Define some constant arrays just to avoid re-creating these
const EMPTY_ARRAY = []
const NO_SUBSCRIPTION_ARRAY = [null, null]

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
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:

      export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)

    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.

    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */
  selectorFactory,
  // options object:
  {
    getDisplayName = name => `ConnectAdvanced(${name})`,
    methodName = 'connectAdvanced',
    renderCountProp = undefined,
    shouldHandleStateChanges = true,
    storeKey = 'store',
    // 获取被connect包裹之后的组件名
    //     getDisplayName = name => `ConnectAdvanced(${name})`,
    //
    //     // 为了报错信息
    //     methodName = 'connectAdvanced',
    //
    //     // 直接翻译了：如果被定义, 名为此值的属性将添加到传递给被包裹组件的 props 中。它的值将是组件被渲染的次数，这对于跟踪不必要的重新渲染非常有用。默认值: undefined
    //     renderCountProp = undefined,
    //
    //     // connect组件是否应响应store的变化
    //     shouldHandleStateChanges = true,
    //
    //     // 使用了多个store的时候才需要用这个，目的是为了区分该获取哪个store
    //     storeKey = 'store',
    //
    //     // 如果为 true，则将一个引用存储到被包裹的组件实例中，
    //     // 并通过 getWrappedInstance()获取到。
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
      // 假设都为false，则说明没有传递store
      invariant(
        didStoreComeFromProps || didStoreComeFromContext,
        `Could not find "store" in the context of ` +
          `"${displayName}". Either wrap the root component in a <Provider>, ` +
          `or pass a custom React context provider to <Provider> and the corresponding ` +
          `React context consumer to ${displayName} in connect options.`
      )
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

    // 根据pure决定渲染逻辑
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
