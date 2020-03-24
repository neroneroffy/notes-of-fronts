import verifySubselectors from './verifySubselectors'

export function impureFinalPropsSelectorFactory(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  dispatch
) {
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
  let hasRunAtLeastOnce = false
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
    *
    * const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {}
    * return proxy
    * */
    dispatchProps = mapDispatchToProps(dispatch, ownProps)
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    hasRunAtLeastOnce = true
    return mergedProps
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps)

    if (mapDispatchToProps.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps(dispatch, ownProps)

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    return mergedProps
  }

  function handleNewProps() {
    // 判断如果需要依赖组件自己的props，将mapStateToProps返回的store中的数据映射出来
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

    if (statePropsChanged)
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
    return mergedProps
  }

  function handleSubsequentCalls(nextState, nextOwnProps) {
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps)
    const stateChanged = !areStatesEqual(nextState, state)
    state = nextState
    ownProps = nextOwnProps
    if (propsChanged && stateChanged) return handleNewPropsAndNewState()    // 当组件自己的props和注入的store中的某些state同时变化时，调用handleNewPropsAndNewState()获取最新的props
    if (propsChanged) return handleNewProps() // 仅当组件自己的props变化时，调用handleNewProps来获取最新的props，此时的props包括注入的props，组件自身的props，和dpspatch内的函数
    if (stateChanged) return handleNewState() // 仅当注入的store中的某些state变化时，调用handleNewState()获取最新的props, 此时的props包括注入的props，组件自身的props，和dpspatch内的函数
    return mergedProps
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    // 第一次渲染，调用handleFirstCall，之后的action派发行为会触发handleSubsequentCalls
    return hasRunAtLeastOnce
      ? handleSubsequentCalls(nextState, nextOwnProps)
      : handleFirstCall(nextState, nextOwnProps)
  }
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

export default function finalPropsSelectorFactory(
  dispatch,
  { initMapStateToProps, initMapDispatchToProps, initMergeProps, ...options }
) {
  const mapStateToProps = initMapStateToProps(dispatch, options) // 这里是wrapMapToProps.js中wrapMapToPropsFunc函数的柯里化调用，是改造
  // 之后的mapStateToProps, 在下边返回的函数内还会再调用一次
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options)
  const mergeProps = initMergeProps(dispatch, options)
  if (process.env.NODE_ENV !== 'production') {
    verifySubselectors(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options.displayName
    )
  }

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
