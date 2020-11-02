const FULLFILED = 'FULLFILED'
const PENDING = 'PENDING'
const REJECTED = 'REJECTED'
class Npromise {
    constructor(executor) {
        this.state = PENDING
        this.result = undefined
        this.successQueue = []
        this.failureQueue = []
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch (e) {
            this.reject(e)
        }
    }

    resolve(value) {
        // 改变promise的状态为FULLFILED
        // 记录promise的结果
        // 触发then中的回调
        if (this.state !== PENDING) return
        const flushSuccessQueue = val => {
          this.state = FULLFILED
          this.result = val
          setTimeout(() => {
            while (this.successQueue.length) {
              const callback = this.successQueue.shift()
              callback(this.result)
            }
          })

        }
        const flushFailureQueue = reason => {
            if (this.state !== PENDING) return
            this.state = REJECTED
            this.result = reason
            setTimeout(() => {
              while (this.failureQueue.length) {
                const callback = this.failureQueue.shift()
                callback(this.result)
              }
            })
        }
        // 因为value 有可能是promise
        if (value instanceof Npromise) {
            value.then(
                res => {
                  flushSuccessQueue(res)
                },
                err => {
                  flushFailureQueue(err)
                }
            )
        } else {
            setTimeout(() => {
                flushSuccessQueue(value)
            })
        }


    }
    reject(reason) {
        // 改变promise的状态为REJECTED
        // 记录promise的结果
        // 触发then中的回调
        setTimeout(() => {
            if (this.state !== PENDING) return
            this.state = REJECTED
            this.result = reason

            while (this.failureQueue.length) {
                const callback = this.failureQueue.shift()
                callback(this.result)
            }
        })
    }

    then(onFullField, onRejected) {
      // then 将onFullField, onRejected注册到队列中

      if (this.state === PENDING) {
        this.successQueue.push(onFullField)
        this.failureQueue.push(onRejected)
      }
      return this
    }

}
const promise1  = new Npromise(resolve => {
    resolve(123)
})
promise1.then(res => {
    console.log('res1', res)
    return '结果2'
})
promise1.then(res => {
    console.log('res2', res)
})

