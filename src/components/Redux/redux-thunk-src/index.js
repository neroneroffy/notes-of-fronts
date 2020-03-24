function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
}

const thunk = createThunkMiddleware();
/*
* 这里是函数的柯里化，真正调用thunk的时候，需要这样thunk({ dispatch, getState })(next)(action)
* 其中，thunk({ dispatch, getState })(next)这部分，相当于改造过后的dispatch，而这部分会在applyMiddleware中去调用，
* 也印证了applyMiddleware会帮我们改造dispatch这一点。
* 从左往右看，{ dispatch, getState }是当前store的dispatch和getState方法，是最原始的，next则是被当前中间件改造之前的dispatch。
* 注意这个next，他与前边的dispatch并不一样，next是被thunk改造之前的dispatch，也就是说有可能是最原始的dispatch，也有可能是被其他中间件改造过的dispatch
* */
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
