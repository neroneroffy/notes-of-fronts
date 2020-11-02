const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
const PENDING = 'PENDING'
function NewPromise(executor) {
  this.state = PENDING
  this.value = undefined
  this.reason = undefined
  this.successQueue = []
  this.failureQueue = []

  const resolve = val => {
    if (this.state !== PENDING) {
      return
    }
    this.state = FULFILLED
    this.value = val
    this.successQueue.forEach(cb => cb(this.value))
  }
  const reject = reason => {
    if (this.state !== PENDING) {
      return
    }
    this.state = REJECTED
    this.reason = reason
    this.failureQueue.forEach(cb => cb(this.reason))
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

NewPromise.prototype.then = function(onFulfilled, onRejected) {

  const self = this
  const promise = new NewPromise((resolve, reject) => {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x
    onRejected = typeof onRejected === 'function' ? onRejected : x => { throw x }
    if (self.state === PENDING) {
      self.successQueue.push(() => {
        setTimeout(() => {
          try {
            const x = onFulfilled(self.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
      self.failureQueue.push(() => {
        setTimeout(() => {
          try {
            const x = onRejected(self.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    } else if (self.state === FULFILLED) {
      setTimeout(() => {
        try {
          const x = onFulfilled(self.value)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    } else if (self.state === REJECTED) {
      setTimeout(() => {
        setTimeout(() => {
          try {
            const x = onRejected(self.reason)
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

function resolvePromise(promise, x, resolve, reject) {
  let hasCalled = false
  if (x === promise) {
    reject(new Error('error'))
  } else {
    if (x && typeof x === 'function' || typeof x === 'object') {
      try {
        let then = x.then
        if (typeof then === 'function') {
          then.call(
            x,
            y => {
              if (hasCalled) {
                return
              }
              hasCalled = true
              resolvePromise(promise, y, resolve, reject)
            },
            z => {
              if (hasCalled) {
                return
              }
              hasCalled = true
              reject(z)
            }
          )
        } else {
          if (hasCalled) {
            return
          }
          hasCalled = true
          resolve(x)
        }
      } catch (e) {
        if (hasCalled) {
          return
        }
        hasCalled = true
        reject(e)
      }
    } else {
      resolve(x)
    }
  }
}

const pro = new NewPromise((resolve, reject) => {
  resolve('success')
})
const pro2 = pro.then(res => {
  console.log('res', res);
  return {
    then: () => {

    }
  }
})
pro2.then(res2 => {
  console.log('res2', res2);
})
console.log(pro2);

module.exports = NewPromise
