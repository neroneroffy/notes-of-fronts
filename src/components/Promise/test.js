const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
const PENDING = 'PENDING'

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        reject(new TypeError('error'))
    } else{
        let hasCalled = false
        if (x && typeof x === 'object' || typeof x === 'function') {
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
                        r => {
                            if (hasCalled) {
                                return
                            }
                            hasCalled = true
                            reject(r)
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

function NewPromise(executor) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined

    this.successQueue = []
    this.failureQueue = []

    const resolve = value => {
        if (this.state === PENDING) {
            this.state = FULFILLED
            this.value = value
            this.successQueue.forEach(cb => cb())
        }
    }

    const reject = reason => {
        if (this.state === PENDING) {
            this.state = REJECTED
            this.reason = reason
            this.failureQueue.forEach(cb => cb())
        }

    }

    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

NewPromise.prototype.then = function (onFulfilled, onRejected) {
    // 如果是pending状态，向队列中注册回调：onFulfilled, onRejected
    // 如果已经是确定状态，直接执行回调

    // 回调的入队是同步的，执行是异步的

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x
    onRejected = typeof onRejected === 'function' ? onRejected : x => { throw x }

    const promise = new NewPromise((resolve, reject) => {
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
                    const x = onFulfilled(this.value)
                    resolvePromise(promise, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
        } else if(this.state === REJECTED) {
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

const promise = new NewPromise((resolve, reject) => {
    resolve('成功')
})
const promise2 = promise.then(
    res => {
        return '成功2'
    },
    err => {

    }
)
promise2.then(res => {
    console.log(res);
})

module.exports = NewPromise