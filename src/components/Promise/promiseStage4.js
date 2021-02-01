const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

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

function NewPromise(executor) {
  this.state = PENDING
  this.value = undefined
  this.reason = undefined
  this.successQueue= []
  this.failureQueue= []

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
NewPromise.prototype.then = function (onFulFilled, onRejected) {
  const promise = new NewPromise((resolve, reject) => {
    onFulFilled = typeof onFulFilled !== 'function' ? x => x : onFulFilled
    onRejected = typeof onRejected !== 'function' ? x => { throw x } : onRejected

    if (this.state === PENDING) {
      this.successQueue.push(() => {
          setTimeout(() => {
            try {
              const x = onFulFilled(this.value)
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
    } else if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulFilled(this.value)
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
    }
  })
  return promise
}

new Promise((resolve, reject) => {
  resolve(true)
}).then(
  res => {
    throw new Error('123')
  },
  reason => {
  }
).then(
  res => {
    console.log('res2', res);
  },
  reason => {
    console.log('res3', reason);
  }
).catch(e => {
  console.log('CATCH', e);
})


module.exports = NewPromise

