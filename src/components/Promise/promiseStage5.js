const FULFILLED = 'FULFILLED'
const PENDING = 'PENDING'
const REJECTED = 'REJECTED'

function NewPromise(executor) {
  this.state = PENDING
  this.value = undefined
  this.reason = undefined
  this.successQueue = []
  this.failureQueue = []

  const resolve = value => {
    if (this.state !== PENDING) {
      return
    }
    this.state = FULFILLED
    this.value = value
    this.successQueue.forEach(cb => cb())
  }
  const reject = reason => {
    if (this.state !== PENDING) {
      return
    }
    this.state = REJECTED
    this.reason = reason
    this.failureQueue.forEach(cb => cb())
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (x === promise) {
    reject(new TypeError('error'))
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

NewPromise.prototype.then = function (onFulfilled, onRejecetd) {
  const promise = new NewPromise((resolve, reject) => {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x
    onRejecetd = typeof onRejecetd === 'function' ? onRejecetd : x => { throw x }

    if (this.state === PENDING) {
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
            const x = onRejecetd(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    } else if (this.state === REJECTED) {
      setTimeout(() => {
        try {
          const x = onRejecetd(this.reason)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    } else if (this.state === FULFILLED) {
      setTimeout(() => {
        try {
          const x = onFulfilled(this.value)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    }
  })

  return promise
}

module.exports = NewPromise
