
function reqTimeControl({ dispatch, getState }) {
  return next => {
    return action => {
      if (typeof action === 'function') {
        let result = action(dispatch, getState);
        if (result) {
          if ('FETCH' in result) {
            const { FETCH } = result
            const thisTime = Date.now()
            // dispatch请求中的action
            next({ type: FETCH.types[0] })
            result = fetch(FETCH.url).then(res => res.json()).then(res => {
              // 请求完成时根据时间判断，是否应更新数据
              const { reqStartLastTime } = getState()
              if (thisTime > reqStartLastTime) {
                next({
                  type: FETCH.types[1],
                  payload: res
                })
                return res
              }
            }).catch(error => {
              next({
                type: FETCH.types[2],
                payload: error,
              })
              return error
            }).finally(() => {
              // 请求完成时将本次的请求发出时间记录到store中
              const { reqStartLastTime } = getState()
              if (thisTime > reqStartLastTime) {
                next({
                  type: '__RECORD_REQUEST_START_POINT__',
                  payload: thisTime
                })
              }
            })
          }
        }
        return result
      }
      return next(action)
    }
  }
}

export default reqTimeControl
