const PENDING = 'pending'
const FULFILLED = 'fulfiled'
const REJECTED = 'rejected'

/*class NewPromise {
  constructor(handler) {
    if (typeof handler !== 'function') {
      throw new Error('callback of NewPromise must be function')
    }
    this.status = PENDING
    this.value = undefined
    this.then.bind(this)
    try {
      handler(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  resolve(result){
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = result
    // this.then(callback(result))
  }

  reject(result) {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.value = result
  }

  then(onResolved, onReject) {

  }
}*/

class NewPromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined
    this.successCallback = []
    this.failureCallback = []
    try {
      handler(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  resolve(value) {
    if (this.state !== PENDING) return
    this.state = FULFILLED
    this.value = value
    // 规范中要求then中注册的回调以异步方式执行，保证在resolve执行所有的回调之前，
    // 所有回调已经通过then注册完成
    setTimeout(() => {
      this.successCallback.forEach(item => {
        item(value)
      })
    })
  }
  reject(reason) {
    if (this.state !== PENDING) return
    this.state = REJECTED
    this.value = reason
    setTimeout(() => {
      this.failureCallback.forEach(item => {
        item(reason)
      })
    })
  }
  then(onFulfilled, onRejected) {
    const { state, value } = this
    return new NewPromise((resolveNext, rejectNext) => {
      const resolveNewPromise = value => {
        try {
          // 正常情况
          if (typeof onFulfilled !== 'function') {
            // 不是函数，直接忽略，将then所属的promise作为then返回的promise的值resolve来做到值的传递
            resolveNext(value)
          } else {
            // 获取then函数回调的执行结果
            const res = onFulfilled(value)
            if (res instanceof NewPromise) {
              // 当执行结果返回的是一个promise实例，等待这个promise状态改变后再改变then返回的promise的状态
              res.then(resolveNext, rejectNext)
            } else {
              // 当返回值是普通值，将其作为新promise的值resolve
              resolveNext(res)
            }
          }
        } catch (e) {
          // 出现异常，新promise的状态变为rejected，reason就是错误对象
          rejectNext(e)
        }
      }
      const rejectNewPromise = reason => {
        try {
          // 正常情况
          if (typeof onRejected !== 'function') {
            // 不是函数，直接忽略，将then所属的promise作为then返回的promise的值reject来做到值的传递
            rejectNext(reason)
          } else {
            // 获取then函数回调的执行结果
            const res = onRejected(reason)
            if (res instanceof NewPromise) {
              // 当执行结果返回的是一个promise实例，等待这个promise状态改变后再改变then返回的promise的状态
              res.then(resolveNext, rejectNext)
            } else {
              // 当返回值是普通值，将其作为新promise的值reject
              rejectNext(res)
            }
          }
        } catch (e) {
          // 出现异常，新promise的状态变为rejected，reason就是错误对象
          rejectNext(e)
        }
      }
      if (state === PENDING) {
        this.successCallback.push(resolveNewPromise)
        this.failureCallback.push(rejectNewPromise)
      }
      // 要保证在当前promise状态改变之后，再去改变新的promise的状态
      if (state === FULFILLED) {
        resolveNewPromise(value)
      }
      if (state === REJECTED) {
        rejectNewPromise(value)
      }
    })
  }
  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
  finally(callback) {
    // 返回值是promise对象，回调在then中执行，也就符合了promise结束后调用的原则
    return this.then(
      // then方法的onFulfiled 和 onRejected都会被传入，保证无论resolved或rejected都会被执行

      // 获取到promise执行成功的结果，将这个结果作为finally返回的新的promise的值
      res => NewPromise.resolve(callback())
          .then(() => {
            return res
          }),
      // 获取执行失败的结果。原理同上
      error => NewPromise.resolve(callback())
          .then(() => {
            throw error
          })
    )
  }
  static allSettled(instanceList) {
    return new NewPromise((resolve, reject) => {
      const results = []
      let count = 0
      if (instanceList.length === 0) {
        resolve([])
        return
      }
      // 定义一个函数，来生成结果数组
      const generateResult = (result, i) => {
        count++
        results[i] = result
        // 一旦全部执行完成，resolve新返回的promise
        if (count === instanceList.length) {
          resolve(results)
        }
      }
      instanceList.forEach((item, index) => {
        // 在每个promise完成后将状态记录到结果数组中
        this.resolve(item).then(
          value => {
            generateResult({
              status: FULFILLED,
              value
            }, index)
          },
          reason => {
            generateResult({
              status: REJECTED,
              reason
            }, index)
          }
        )
      })
    })
  }
  static resolve(value) {
    // value不存在，直接返回一个resolved状态的promise
    if (!value) {
      return new NewPromise(function (resolve) {
        resolve()
      })
    }
    // value是promise实例，直接返回
    // 在这里需要首先判断是否是promise实例，再进行下边的判断
    // 因为我们自己构造的promise也是是object，也有then方法
    if (value instanceof NewPromise) {
      return value
    }
    // 是thenable对象，返回的新的promise实例需要在value状态改变后再改变，且状态跟随value的状态
    if (typeof value === 'object' && typeof value.then === 'function') {
      return new NewPromise((resolve, reject) => {
        value.then(resolve, reject)
      })
    }
    // value是普通值，返回新的promise并resolve这个普通值
    return new NewPromise(resolve => {
      resolve(value)
    })
  }
  static reject(reason) {
    return new NewPromise((resolve, reject) => {
      reject(reason)
    })
  }
  static all(instanceList) {
    return new NewPromise((resolve, reject) => {
      // 定义存放结果的数组
      const results = []
      let count = 0
      if (instanceList.length === 0) {
        resolve(results)
        return
      }
      instanceList.forEach((item, index) => {
        // 由于实例列表中的每个元素可能是各种各样的，所以要用this.resolve方法包装一层
        this.resolve(item).then(res => {
          results[index] = res
          count++
          // 当都执行完，resolve新返回的promise
          if (count === instanceList.length) {
            resolve(results)
          }
        }, error => {
          // 一旦有一个出错，就reject新返回的promise
          reject(error)
        })
      })
    })
  }
  static race(instanceList) {
    return new NewPromise((resolve, reject) => {
      if (instanceList.length === 0) {
        resolve([])
        return
      }
      instanceList.forEach(item => {
        // 由于实例列表中的每个元素可能是各种各样的，所以要用this.resolve方法包装一层
        this.resolve(item).then(res => {
          // 一旦有一个resolve了，那么新返回的promise状态就被resolve
          resolve(res)
        }, error => {
          reject(error)
        })
      })
    })
  }
}

function testPromise() {

/*  const promise2 = new NewPromise((resolve, reject) => {
    setTimeout(() => {
      reject('哈哈哈')
    }, 1000)
  })
  const promise3 = new NewPromise((resolve, reject) => {
    resolve('正确')
  })
  NewPromise.allSettled([promise2, promise3]).then(res => {
    console.log('正确的结果', JSON.stringify(res));
  }, reject => {
    console.log(reject);
  })*/
  new NewPromise(res => res("resolved"))
    .then(value => console.log("resolved then should async", value));
  console.log("this should be consoled first")
}

export default testPromise

