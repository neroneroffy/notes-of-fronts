const PENDING = 'PENDING'
const FULLFILED = 'FULLFILED'
const REJECTED = 'REJECTED'
class Npromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined
    this.successQueue = this.failureQueue = []
    try {
      handler(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
  resolve(resolveVal) {
    const flushSuccessQueue = () => {
      while (this.successQueue.length) {
        const successCallback = this.successQueue.shift()
        setTimeout(() => {
          successCallback()
        })
      }
    }
    const flushFailureQueue = () => {
      while (this.failureQueue.length) {
        const failureCallback = this.failureQueue.shift()
        setTimeout(() => {
          failureCallback()
        })
      }
    }
    this.value = resolveVal
    this.state = FULLFILED
    if (resolveVal instanceof Npromise) {
      resolveVal.then(
        () => {
          flushSuccessQueue()
        },
        () => {
          flushFailureQueue()
        }
      )
    } else {
      flushSuccessQueue()
    }
  }
  reject(reason) {
    this.value = reason
    this.state = REJECTED
    while (this.failureQueue.length) {
      const failureCallback = this.failureQueue.shift()
      setTimeout(() => {
        failureCallback()
      })
    }
  }
  then(onFullField, onRejection) {
    const resolutionProcedure = (x, promise, resolve, reject) => {
      let hasBeenCalled = false
      if (x === promise) {
        throw new Error('error')
        return
      }
      if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
          let then = x.then
          if (typeof then === 'function') {
            then.call(
              x,
              y => {
                if (hasBeenCalled) {
                  return
                }
                hasBeenCalled = true
                resolutionProcedure(y, promise, resolve, reject)
              },
              r => {
                if (hasBeenCalled) {
                  return
                }
                hasBeenCalled = true
                reject(r)
              }
            )
          } else {
            reject(x)
          }

        } catch (e) {
          if (hasBeenCalled) {
            return
          }
          hasBeenCalled = true
          reject(e)
        }
      } else {
        resolve(x)
      }
    }
    const resolvePromise = (resolve, reject) => {

    }
    const returnPromise = new Npromise((resolve, reject) => {
      if (this.state === PENDING) {
        this.successQueue.push(onFullField)
        this.failureQueue.push(onRejection)
      }

      if (this.state === FULLFILED) {
        resolve()
      }
      if (this.state === REJECTED) {
        reject()
      }
    })
    return returnPromise
  }
}
/*
* 各种值的透传
* */
// x 是普通值,promise2被resolved，值为x
/*
const promise1 = new Promise((resolve, reject) => {
  resolve('promise1 success')
})
const promise2 = promise1.then(res => {
  console.log('promise1 res', res)
  return 'promise2 success'
})
promise2.then(res => {
  console.log('promise2 res', res)
})
*/
// x 是promise.then,报错
/*
const promise1 = new Promise((resolve, reject) => {
  resolve('promise1 success')
})
const promise2 = promise1.then(res => {
  console.log('promise1 res', res)
  return 'promise2 success'
})
promise2.then(res => {
  console.log('promise2 res', res)
})
*/

//-------------------- x 是thenable对象，onResolve或者onRejected被调用的情况
/*const promise1 = new Promise((resolve, reject) => {
  resolve('promise1 success')
})
const promise2 = promise1.then(res => {
  console.log('promise1 res', res)
  return {
    then: (onResolve, onRejected) => {
      onResolve('promise1的then函数内第一个参数是thenable对象，resolved')
      // onRejected('promise1的then函数内第二个参数是thenable对象， rejected')
    }
  }
})
promise2.then(
  res => {
    console.log('promise2 res', res)
  },
  err => {
    console.log('promise2 err', err)
  }
)*/

//-------------------- x 是thenable对象， onResolve或者onRejected均不被调用，
// promise2一直处在pending状态，
/*
const promise1 = new Promise((resolve, reject) => {
  resolve('promise1 success')
})
const promise2 = promise1.then(res => {
  console.log('promise1 res', res)
  return {
    then: (onResolve, onRejected) => {
      // onResolve('promise1的then函数内第一个参数是thenable对象，resolved')
      // onRejected('promise1的then函数内第二个参数是thenable对象， rejected')
    }
  }
})
promise2.then(
  res => {
    console.log('promise2 res', res)
  },
  err => {
    console.log('promise2 err', err)
  }
)

*/
//-------------------- x 是thenable对象，其then方法抛出异常，
// promise2状态变为rejected，如果onResolve, onRejected已经被调用，则忽略错误，否则以e为reason reject promise3
/*
const promise1 = new Promise((resolve, reject) => {
  resolve('promise1 success')
})
const promise2 = promise1.then(res => {
  console.log('promise1 res', res)
  return {
    then: (onResolve, onRejected) => {
      throw new Error('thenable对象执行出错')
      // onResolve('promise1的then函数内第一个参数是thenable对象，resolved')
      // onRejected('promise1的then函数内第二个参数是thenable对象， rejected')
    }
  }
})
promise2.then(
  res => {
    console.log('promise2 res', res)
  },
  err => {
    console.log('promise2 err', err)
  }
)
*/
