export const LOGING_BEGIN = 'LOGING_BEGIN'
export const LOGING_END = 'LOGING_END'
export const FETCH_BEGIN = 'FETCH_BEGIN'
export const FETCH_SUCCESS = 'FETCH_SUCCESS'
export const FETCH_FAILURE = 'FETCH_FAILURE'
export const RECORD_REQUEST_START_POINT = 'RECORD_REQUEST_START_POINT'

export const toggleProject = project => {
  return dispatch => {
    dispatch({ type: LOGING_BEGIN, payload: project })
    setTimeout(() => {
      dispatch({
        type: LOGING_END
      })
    }, 1000)
  }
}
// 问题来源于一次无意中在项目里发现的bug，场景是组件会在切换项目后重新渲染，在每次重渲染后，挂载完毕会请求对应的当前项目的数据，存到store中展示到页面上。
// 但由于网络请求时间的长短是难以预测的，这就引发了一个问题：
// 切换到B项目，请求发出了但还没回来，这时候再切换到A项目。那么现在同时存在两个请求，先前的请求B和新的请求A。
// 请求A的速度比较快，马上成功了，将数据存到store中，展示出来了。但过一会请求B又回来了，也会把数据存到store。但这时候是在A项目下，但数据一开始是A的，后来又会被
// 替换成请求B的。这个时候就有问题了。
// 只针对这个问题，可以将请求回的数据放到组件中存储，由于切换项目后，先前的组件销毁了，显示的是新的组件，那么自然就不会出现问题了。
// 但有一点需要注意：这种方式需要在组件销毁时，取消掉请求，或者在请求成功后判断组件是否已经销毁，再设置state，因为我们不能在一个已销毁的组件中设置它的state。
// 不过对于已有项目来说，往往放到store中的数据需要被别的地方依赖，不能将数据放到组件中存储。
// 既然如此，就要考虑如何在尽可能不动数据的基础上，来进行控制了。
// 问题出在两个请求一个快一个慢，慢的请求数据覆盖了快的请求的数据，
// 控制的点在哪呢？在于请求成功后将数据存入store这个时候。
// 怎么控制呢？当然是是否将请求成功的数据更新到store
// 怎么判断是否应更新到store中呢？
// 其实明确一点就好了，切换项目导致了一先一后两个请求发出，后发出的请求肯定是对应着当前已经切换的项目。
// 只要识别出当前的请求是不是后发出的请求就可以判断是否应该存储数据了。
// 需要在store中存储一个时间，来记录本次请求发出的时间
// 在发出请求的时候，获取一个时间戳存到一个变量中作为当前请求的开始时间点，然后等请求完成，将这个时间点记录到store中，这样下次请求过来的时候，
// 这个时就相当于上一次请求的发出时间点了。
// 请求成功时，从store中获取到上次的时间点，与本次请求发出的时间相比较，只有当本次发出时间大于上次请求时间的时候，才将数据存到store中。
// 结合场景来说，切换到项目B，发请求记录B发出的时间点，再切换到A，发请求记录A发出的时间点。此时，两个时间点A > B > store中记录的时间点。
// A请求先回来，判断，A时间点 > store中记录的时间点通过，存储据，将A时间点更新到store中，过了一会B回来了，验证B时间点 < A时间点，不通过，不存数据。
export const fetchData = project => {
  return dispatch => {
    return dispatch(() => {
      return {
        FETCH: {
          types: [ FETCH_BEGIN, FETCH_SUCCESS, FETCH_FAILURE ],
          url: `/api/request/${project}`
        },
      }
    })
  }
}
