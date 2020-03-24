import verifyPlainObject from '../utils/verifyPlainObject'

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

// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
//
// A length of one signals that mapToProps does not depend on props from the parent component.
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..
// 根据mapStateToProps函数的参数个数，判断组件是否应该依赖于自己的props(mapToProps.length !== 1)
// const mapStateToProps = (state, ownProps) => {
//    return {}
// }
export function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined
    ? Boolean(mapToProps.dependsOnOwnProps)
    : mapToProps.length !== 1
}

// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
//
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//wrapMapToPropsFunc(mapToProps, methodName)(dispatch, { displayName })
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
      // 根据组件是否传入了组件本身从父组件接收的props来确定是否需要向组件中注入ownProps，最终会用来实现组件自身的props变化，也会调用mapToProps的目的
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps)
      // 再去执行proxy。这时候proxy.mapToProps已经被赋值为我们传进来的mapToProps函数了，所以props就会被赋值成传进来的函数的返回值
      let props = proxy(stateOrDispatch, ownProps)
      if (typeof props === 'function') {
        // 如果返回值是函数，那么再去执行这个函数+++
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

//
