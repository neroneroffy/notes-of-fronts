# 竞态请求的Redux中间件解决方案

这个问题来源于一次无意中在项目里发现的bug，场景是组件会在切换项目后重新渲染，每次重渲染后，组件挂载完毕会请求对应的当前项目的数据，存到store中展示到页面上。

但网络请求时间的长短是难以预测的，这就引发了一个问题：

切换到B项目，请求发出了但还没回来，这时候再切换到A项目。那么现在同时存在两个请求，先前的请求B和新的请求A。

请求A的速度比较快，马上成功了，将数据存到store中，展示出来。

但过一会请求B又回来了，也会把数据存到store。但这时候是在A项目下，数据一开始是A的，后来又会被替换成请求B的。这个时候就有问题了。

这就是请求的竞态问题，就像现在这样：

![before.gif](https://user-gold-cdn.xitu.io/2019/12/8/16ee4d3a5cff5421?w=1205&h=634&f=gif&s=263598)

*为了模拟效果，在webpackDevServer中加了一个接口，根据项目参数来控制响应时间*
```
before(app, server){
  app.get('/api/request/:project', function (req, res) {
    const { project } = req.params
    if (project === 'B') {
      setTimeout(() => {
        res.send({result: 'B的结果'})
        res.status(200)
      }, 4000)
      return
    }
    setTimeout(() => {
      res.send({result: 'A的结果'})
      res.status(200)
    }, 1000)
  })
}
```

## 解决办法
只针对这个问题，有一种简单的方法，可以将请求回的数据放到组件中存储，由于切换项目后，先前的组件销毁了，显示的是新的组件，那么自然就不会出现问题了。

但有一点需要注意：这种方式需要在组件销毁时，取消掉请求，或者在请求成功后判断组件是否已经销毁，再设置state，因为我们不能在一个已销毁的组件中设置它的state。
## 更合适的
不过对于已有项目来说，往往放到store中的数据需要被别的地方依赖，不能将数据放到组件中存储。

既然如此，就要考虑如何在尽可能不动数据的基础上，来进行控制了。

现在的问题出在两个请求一个快一个慢，慢的请求数据覆盖了快的请求的数据。

那么控制的点在哪呢？在于请求成功后将数据存入store这个时候。

怎么控制呢？是否将请求成功的数据更新到store。

那怎么判断是否应更新到store中呢？
其实明确一点就好了，切换项目导致了一先一后两个请求发出，后发出的请求肯定是对应着当前已经切换的项目。
只要识别出当前的请求是不是后发出的请求就可以判断是否应该存储数据了。
可以根据时间来判断，这就需要在store中存储一个时间，来记录当次请求发出的时间：**reqStartLastTime**
![image.png](https://user-gold-cdn.xitu.io/2019/12/8/16ee4d50b0d80f88?w=677&h=451&f=png&s=11146)
### 具体做法
在发出请求的时候，获取一个时间戳作为当前请求的开始时间点，然后等请求完成，将这个时间点记录到store中。这样下次请求过来的时候，这个时就相当于上一次请求的发出时间点了。

请求成功时，从store中获取到上次的时间点，与本次请求发出的时间相比较，只有当本次发出时间大于上次请求发出时间的时候，才将数据存到store中。

结合场景来说，切换到项目B，发请求记录B发出的时间点，再切换到A，发请求记录A发出的时间点。此时，两个时间点A > B > store中记录的时间点。

A请求先回来，判断，A时间点 > store中记录的时间点，通过，存储据，将A时间点更新到store中，过了一会B回来了，验证B时间点 < A时间点，不通过，不存数据。
```
export const fetchData = project => {
  return (dispatch, getState) => {
    const reqStartThisTime = Date.now()
    dispatch({ type: FETCH_BEGIN })
    fetch(`/api/request/${project}`)
      .then(res => res.json())
      .then(res => {
        // 从store中获取上一次的请求发出时间reqStartLastTime
        const { view: { reqStartLastTime } } = getState()
        // 进行比较，只有当前请求时间大于上一次的请求发出时间的时候，再存数据
        if (reqStartThisTime > reqStartLastTime) {
          dispatch({
            type: FETCH_SUCCESS,
            payload: res.result,
          })
        }
      }).finally(() => {
      const { view: { reqStartLastTime } } = getState()
       // 请求完成时，将当前更新时间为后发出请求的请求时间
        dispatch({
          type: RECORD_REQUEST_START_POINT,
          payload: reqStartThisTime > reqStartLastTime ？ reqStartThisTime ：reqStartLastTime
        })
    })
  }
}
```
效果如下，重点观察请求200的先后顺序：

![after.gif](https://user-gold-cdn.xitu.io/2019/12/8/16ee4d3e58c5cbda?w=1207&h=654&f=gif&s=245211)

至此，问题已经被解决了，但仍然不完美，因为不止这一个地方需要如此的处理。

## 更进一步
上面为一个特定场景提供了一个解决方案。通过在异步action中设置、获取、以及比较请求的发出时间来控制是否应向store中存储请求结果，但这样的场景可能会很多，这就造成了重复的逻辑。对于重复性的逻辑尽可能封装起来，将精力集中到业务上，这就要引出redux的中间件概念了。

redux的middleware的目标是改造dispatch，但是也可以不改造，可以将一些通用逻辑放到中间件中去，最后直接调用dispatch就好。

回顾一下上面在异步action中的过程：
* 请求发出时，记录当前时间为本次请求时间
* 请求完成时，比较本次发出时间与上次发出时间，将大的记录到store中
* 请求成功时，比较本次发出时间与上次发出时间，一旦前者大于后者，将数据放到store中。

可以看出，也只有前两步的逻辑可以与业务分开。因为请求完成记录结果这个动作是完全在请求成功的回调之内的，这时dispatch的是真正的action，无法下手。

那么现在可以敲定，将存储请求时间的逻辑抽象到中间件中，而在异步action的业务代码中，只从store中获取本次请求时间与上次请求时间，进行比较，从而决定是否要存储请求结果。

*注意，上面只向store记录了一个时间，就是上次请求发出时间，但这里将记录当前时间为本次请求时间也抽象出来了，所以要在store中再增加一个字段，记录成当前请求发出的时间*

新建一个中间件，其实可以将redux-thunk的逻辑整合进来，再增加要抽象的逻辑。
```
function reqTimeControl({ dispatch, getState }) {
  return next => {
    return action => {
      if (typeof action === 'function') {
        const result = action(dispatch, getState);
        if (result && 'then' in result) {
          // 请求开始时将当前时间记录为本次请求时间，放入store
          const thisTime = Date.now()
          next({
            type: '__RECORD_REQUEST_THIS_TIME__',
            payload: thisTime
          })
          const { reqStartLastTime, reqStartThisTime } = getState()
          result.finally(() => {
            // 请求完成将本次请求时间与上次请求时间进行比较，将store中的时间更新为大的
            if (reqStartThisTime > reqStartLastTime) {
              next({
                type: '__RECORD_REQUEST_START_POINT__',
                payload: reqStartThisTime
              })
            }
          })
        }
        return result
      }
      return next(action)
    }
  }
}

export default reqTimeControl
```
在传入applyMiddleware，替换掉redux-thunk
```
import { global, view, reqStartLastTime, reqStartThisTime } from './reducer'
import reqTimeControl from './middleware'

const store = createStore(
  combineReducers({ global, view, reqStartLastTime, reqStartThisTime }),
  applyMiddleware(reqTimeControl),
)
export default store
```
为了让中间件知道请求的状态，需要在异步action中将返回promise的fetch返回出去。现在只用获取两个时间进行比较，就能决定是否更新数据了。
```
export const fetchData = project => {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_BEGIN,
    })
    return fetch(`/api/request/${project}`)
      .then(res => res.json())
      .then(res => {
        const { reqStartLastTime, reqStartThisTime } = getState()
        if (reqStartThisTime > reqStartLastTime) {
          dispatch({
            type: FETCH_SUCCESS,
            payload: res.result,
          })
        }
      })
  }
}
```
可以看到，将逻辑抽象到中间件中依然实现了效果，但是却只用关心业务处理了。
![new.gif](https://user-gold-cdn.xitu.io/2019/12/8/16ee4d5c92ce7f0e?w=1265&h=694&f=gif&s=245526)

redux变化
![redux.gif](https://user-gold-cdn.xitu.io/2019/12/8/16ee4d5f1e4e11f8?w=1683&h=733&f=gif&s=356777)


## 还不算完
现在的存储store业务逻辑是处在请求成功的回调中的，中间件无法对这里dispatch的action进行控制。所以第二种方法依然没有完全摆脱掉重复逻辑，仍然需要在业务中配合返回fetch的promise，而且需要从store中获取两个时间进行比较。


### 中间件又来了
有没有办法将所有涉及到时间的处理逻辑放到一个地方，让业务代码还像之前那样，只包含action，不感知到这层处理呢？当然可以，但需要让中间件来接管请求。因为这一层处理，贯穿整个网络请求的周期。

如何来让中间件接管请求，以及如何让中间件做这一系列的控制呢？思考一下，在中间件中可以获取到异步action（也就是dispatch的函数）执行的结果，但在这个异步action中，不会去发请求，请求交给中间件来处理，中间件监听到返回结果中一旦有发送请求的信号，那么就开始请求。

所以，要改造一下需要发请求的异步action的样板代码：
```
export const fetchData = project => {
  return dispatch => {
    return dispatch(() => {
      return {
       // FETCH就是告诉中间件，我要发起异步请求了，
       // 对应了三个请求的action: FETCH_BEGIN, FETCH_SUCCESS, FETCH_FAILURE，
       // 请求地址是url
        FETCH: {
          types: [ FETCH_BEGIN, FETCH_SUCCESS, FETCH_FAILURE ],
          url: `/api/request/${project}`
        },
      }
    })
  }
}
```
再看中间件中的处理，要根据返回结果，判断是否应该发送请求，改造一下：
```
function reqTimeControl({ dispatch, getState }) {
  return next => {
    return action => {
      if (typeof action === 'function') {
        let result = action(dispatch, getState);
        if (result) {
          if ('FETCH' in result) {
            const { FETCH } = result
            // dispatch请求中的action
            next({ type: FETCH.types[0] })
            // 这里将result赋值为promise是为了保证在组件中的调用函数是一个promise，
            // 这样能够在组件中根据promise的状态有更大的业务自由度，比如promise.all
            result = fetch(FETCH.url).then(res => res.json()).then(res => {
              next({
                type: FETCH.types[1],
                payload: res
              })
              return res
            }).catch(error => {
              next({
                type: FETCH.types[2],
                payload: error,
              })
              return error
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
```
这里需要注意一下，要将fetch作为result返回出去，目的是让我们在组件中调用的获取数据的函数是一个promise，从而可以更自由地进行控制，例如需要等待多个请求都完成时做一些操作：
```
const ProjectPage = props => {
  const { fetchData, fetchOtherData, result, project } = props
  useEffect(() => {
    Promise.all([fetchData(), fetchOtherData()]).then(res => {
      // do something
    })
  }, [])
  return <div>
    <h1>{ result }</h1>
  </div>
}

```
现在已经完成了中间件的改造，让它可以控制发起异步请求，结合我们遇到的场景以及上面的解决方案，只需要将上面实现的逻辑整合到中间件中即可：
```
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
```
值得注意的是：由于是在中间件中，直接获取当前时间就行，所以不用再把每次的请求发出时间记录到store中，也就省去了这一步：
```
  next({
    type: '__RECORD_REQUEST_THIS_TIME__',
    payload: thisTime
  })
```
效果依然相同，这里就不放图了。

到现在为止，应该达到了一个令人满意的效果，将维护时间、判断是否存数据这样的重复逻辑抽象到中间件中，只关心业务代码就可以，而且可以应对几乎所有这样的场景。
## 总结
这次把简单问题的重复逻辑抽象到了中间件中，搭配Redux才算解决了请求的竞态问题。解决问题的同时也用中间件实现了一个简单的请求拦截器，可以进行token的添加、loading状态的处理等操作。文章中的例子只是实现了一个大致的效果，实际上中间件中的fetch要封装一下才能应对大部分的业务场景，比如各种请求method、body、header参数这些。另外，如果想了解中间件的原理，为你准备了一篇文章：[简单梳理Redux的源码与运行机制](https://juejin.im/post/5ce20efcf265da1b5e72c450)

如果想了解我的更多技术文章，可以关注公众号：一口一个前端
![qrcode-small.jpg](https://user-gold-cdn.xitu.io/2019/12/8/16ee4d6437e2cd69?w=200&h=200&f=jpeg&s=41585)


