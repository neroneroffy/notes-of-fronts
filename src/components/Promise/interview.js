const PENDING = 'PENDING'
const FuLFILLED = 'FuLFILLED'
const REJECTED = 'REJECTED'
class NewPromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined
    this.successQueue = []
    this.failureQueue = []
    try {
      handler(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
  resolve = value => {
    if (this.state !== PENDING) {
      return
    }
    this.value = value
    this.state = FuLFILLED
    this.successQueue.forEach(cb => {
      cb()
    })
  }
  reject = reason => {
    if (this.state !== PENDING) {
      return
    }
    this.reason = reason
    this.state = REJECTED
    this.failureQueue.forEach(cb => {
      cb()
    })
  }
}
/*function resolvePromise (promise, x, resolve, reject) {
  if (x === promise) {
    throw new TypeError('error')
  } else {
    if (x && typeof x === "object" || typeof x === 'function') {
      let hasBeenCalled = false
      try {
        const then = x.then
        if (typeof then === 'function') {
          then.call(
            x,
            xValue => {
              if (hasBeenCalled) {
                return
              }
              hasBeenCalled = true
              resolvePromise(promise, xValue, resolve, reject)
            },
            xReason => {
              if (hasBeenCalled) {
                return
              }
              hasBeenCalled = true
              reject(xReason)
            }
          )
        } else {
          resolve(x)
        }
      } catch (e) {
        if (!hasBeenCalled) {
          reject(e)
          hasBeenCalled = true
        }
      }
    } else {
      resolve(x)
    }
  }
}*/

function resolvePromise(promise, x, resolve, reject) {
  if (x === promise) {
    throw new TypeError('error')
  } else {
    if (x && typeof x === 'object' || typeof x === 'function') {
      let hasBeenCalled = false
      try {
        const then = x.then
        if (typeof then === 'function') {
          then.call(
            x,
            xValue => {
              if (hasBeenCalled) {
                return
              }
              hasBeenCalled = true
              resolvePromise(promise, xValue, resolve, reject)
            },
            xReason => {
              if (hasBeenCalled) {
                return
              }
              hasBeenCalled = true
              reject(xReason)
            }
          )
        } else {
          resolve(x)
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
}
NewPromise.prototype.then = function (onFulfilled, onRejected) {
  const promise = new NewPromise((resolve, reject) => {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x
    onRejected = typeof onRejected === 'function' ? onRejected : x => { throw x }

    if (this.state === FuLFILLED) {
      setTimeout(() => {
        try {
          const x = onFulfilled(this.value)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    } else if (this.state === REJECTED) {
      setTimeout(() => {
        try {
          const x = onRejected(this.reason)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    } else if (this.state === PENDING) {
      this.successQueue.push(() => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
      this.failureQueue.push(() => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }

  })
  return promise
}

module.exports = NewPromise
