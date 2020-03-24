## 写在前面
promise经常用，但不知道其实现原理。抽时间研究了一下实现，发现东西真的不少。阅读文章之前需要了解其用法，结合用法看文章可能更容易理解。
## 结构
先看一下简单的用法。
```
const promise = new Promise((resolve, reject) => {
   setTimeout(() => {
       resolve('success')
   })
})
.then(value => { ... }, reason => { ... })
.catch(error => { ... })

```
Promise的构造函数接收了一个回调，这个回调就是下面要讲到的执行器，执行器的参数resolve, reject也是两个函数，
负责改变promise实例的状态和它的值，then函数中的回调在状态改变后执行。

如果要实现一个最简单的promise类，内部结构都要包含什么呢？
* 状态：fulfiled、rejected、pending
* 值：promise的值
* 执行器：提供改变promise状态的入口
* resolve和reject方法：前者将promise改变为fulfiled，后者将其改变为rejected。可以在执行器内根据实际业务来控制是resolve或reject。
* then方法：接收两个回调，onFulfilled, onRejected。分别在promise状态变为fulfiled或rejected后执行，这里涉及到将回调注册进两个执
行队列的操作，后文会讲到

```
const PENDING = 'pending'
const FULFILLED = 'fulfiled'
const REJECTED = 'rejected'

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

  // resolve和reject方法
  resolve(value) { ... }
  reject(reason) { ... }

  // then方法
  then(onFulfilled, onRejected) { ... }
}
```
结构中的每个部分是如何实现的呢？
## Promise的执行器
执行器是我们初始化promise时候传入的回调，是我们改变promise状态的入口，所以执行器的实现不复杂，也就是将我们传入的回调执行一下。
```
class NewPromise {
  ...
  handler(resolve.bind(this), reject.bind(this))
  ...
}
```
实际上，执行器会接受两个回调，resolve和reject。它们真正起到改变promise状态的作用。

## resolve和reject
实际上是两个函数，所做的事情不复杂。
* 改变promise的状态
* 将接收的值作为promise的value
* 依次执行then中注册的回调
```
const PENDING = 'pending'
const FULFILLED = 'fulfiled'
const REJECTED = 'rejected'

class NewPromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined

    // 两个队列，后面会讲到
    this.successCallback = []
    this.failureCallback = []
    try {
      // 执行器，由于resolve和reject中用到了this，这里需要bind一下
      handler(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  resolve(value) {
    if (this.state !== PENDING) return
    this.state = FULFILLED
    this.value = value
    // 用setTimeout模拟异步方式
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
        setTimeout(item(reason))
      })
    })
  }
}

```
看一下它们的实现，改变状态、赋值value，最重要的一点：循环执行then方法注册到队列中的回调。
而规范中要求回调以异步方式执行，保证在执行所有的回调之前，所有回调已经通过then注册完成，所以这里用setTimeout模拟了一下。

## then方法：
（翻译整理自[Promise/A+ 规范](https://promisesaplus.com/)）
promise必须提供then方法来访问这个promise当前或者最终的值
then方法有两个参数：onFulfilled, onRejected，都是可选的。关于这两个参数，这里有几个规则：
### onFulfilled, onRejected都不是函数的时候，必须被忽略
实际上忽略也就是如果不是函数，默认给它赋值成函数，返回值为then所属的promise的值。这样是做是为了在then()函数未传回调的时候，可以将promise的值传递下去。
```
promise(resolve => resolve('success'))
    .then()
    .then(function(value) {
     console.log(value)
    })
```
具体实现上，在它不是函数的时候可以给它赋值一个默认函数，也可以直接调用新返回的promise中的resolve或reject将值传下去，来达到忽略的效果
### onFulfilled是函数的时候
* 必须在当前的promise的状态变为fulfilled的时候被调用，promise被resolve的值也就是它的第一个参数
* 不能在fulfilled之前被调用
* 最多只能被调用一次
### onRejected是函数的时候
* 必须在当前的promise的状态变为rejected的时候被调用，promise被reject的值也就是它的第一个参数。不能在rejected之前被调用，
* 最多只能被调用一次。
### then可能会被调用多次
* 当promise状态变为fulfilled，所有onFulfilled将会按照最开始在then方法中注册的顺序去调用
* 当promise状态变为rejected，所有onRejected将会按照最开始在then方法中注册的顺序去调用
就像下边这样：
```
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve('success'))
  })
  promise.then(res => {
    console.log(res, '第一次');
  })
  promise.then(res => {
    console.log(res, '第二次');
  })
```

鉴于这种情况，需要在我们实现的promise内部维护两个队列，队列中的元素是then方法内的回调函数（onFulfilled, onRejected），每调用一次then，
就向队列中push一个回调，它们会在promise状态改变时被依次执行。

### 返回一个promise，便于链式调用
```
 promise2 = promise1.then(onFulfilled, onRejected);
```
then返回的promise（也就是promise2）的状态，取决于其回调函数（onFulfilled或onRejected）的返回值或者promise1的状态，具体表现为：
* onFulfilled或onRejected的返回值是一个值x，那么promise2的状态为resolve，值为x
* 如果onFulfilled或onRejected执行出错，并抛出了错误对象e，那么promise2的状态为rejected，值为这个错误对象e
* 如果onFulfilled不是一个函数，但promise1状态变为fulfilled，那么promise2状态也为fulfilled，值与promise1相同
* 如果onRejected不是一个函数，但promise1状态变为rejected，那么promise2状态也为rejected，值与promise1相同（这个值是作为promise2的reason）

### 实现
上面我们认识了then方法，结合定义和平时的用法可以猜测出我们自己实现的promise内的then方法需要做下边几件事：
* 返回一个新的promise实例
* then所属的Promise在pending状态，将then的回调（onFulfilled, onRejected）分别放入执行队列等待执行，而这两个队列内的函数只有在then所属的
promise状态被改变的时候执行。保证了规范中的onFulfilled, onRejected的执行时机。
* then所属的Promise状态不为pending时，执行队列中的回调开始依次执行，然后根据已经改变的状态以及回调的返回值来决定新的promise的状态
    - 举例来说：
    ```
    const promise1 = new Promise((resolve, reject) =>{ ... })
    const promise2 = promise1.then(value => {
      return 'success'
    }, reason => {
      return 'failed'
    })
    ```
    假设promise1被resolve了，由于then中传入了代表onFulfilled的回调并且返回值为success，那么promise2会被resolve，值为success。
    假设promise2被reject了，由于then中传入了代表onRejected的回调并且返回值为failed，那么promise2会被reject，reason是failed

下面一步步来实现then方法，先上结构：
```
class NewPromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined

    // 两个队列，存放onFulfiled 和 onRejected
    this.successCallback = []
    this.failureCallback = []
    try {
      handler(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }
  then(onFulfilled, onRejected) {
    return new NewPromise((resolveNext, rejectNext) => {
      // pengding状态向队列中注册回调
      if (state === PENDING) {
        successCallback.push(onFulfilled)
        failureCallback.push(onRejected)
      }

      // 要保证在当前promise状态改变之后，再去通过resolveNext或者rejectNext改变新的promise的状态
      if (state === FULFILLED) {
        resolveNext(value)
      }
      if (state === REJECTED) {
        rejectNext(value)
      }
    })
  }
}
```
上面的结构基本实现了then函数的大概逻辑，但是没有实现根据onFulfilled, onRejected两个回调的执行结果来决定新的promise的状态的效果，
只是将他们分别放到了各自的执行队列中去。

最终then返回的promise的状态和onFulfilled, onRejected的执行结果有关。我根据规范和实际情况整理了一张图：


然后让我们用代码来实现它（单以onFulfilled的执行情况举例）
```
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

```
整个这一部分，需要放入队列中等待then所属的promise状态改变再执行，从而改变then返回的promise的状态。
所以，我们需要将这一块包装起来。整合起来就是：
```
class NewPromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined

    // 两个队列，存放onFulfiled 和 onRejected
    this.successCallback = []
    this.failureCallback = []
    try {
      handler(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
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
}
```
我们在自己的实现中是定义了两个数组作为任务队列存放then注册的回调，而实际的promise中，
then方法是将回调注册到微任务队列中。等到promise状态改变，执行微任务队列中的任务。微任务在概念上可以认为是异步任务，这也印证了规范中then的回调必须
异步执行的说法。关于事件循环的一些知识点，我总结过一篇文章，[今天，我明白了JS事件循环机制](https://juejin.im/post/5d3da600f265da1bb9702667)。

## catch函数
catch函数是用来处理异常的，当promise状态变为rejected的时候，捕获到错误原因。那么假设不用catch，也可以在then函数的第二个回调中捕获这个错误。
而且catch返回的是一个promise，所以与调用Promise.prototype.then(undefined, onRejected)的行为是一样的
```
catch(onRejected) {
  return this.then(undefined, onRejected)
}
```
## resolve方法
Promise.resolve(value)返回的是一个promise对象，用于将传入的值value包装为promise对象。

那这样做有什么意义呢？实际上value是一个不确定的值，可能是promise也可能不是，没准可以调用then方法，也没准不可以。但是可以通过resolve方法将行为统一
起来。

```
const promise = function() {
  if (shouldBePromise) {
    return new Promise(function(resolve, reject) {
        resolve('ok')
    })
  }
  return 'ok'
}
promise().then(() => {
    ...
})
```
promise返回的结果取决于shouldBePromise，假设shouldBePromise为false，那么promise就返回了字符串ok，下边就不能调用then方法。
这个时候可以用Promise().resolve包起来，这样promise返回的始终是一个promise实例，保证了then方法的顺利调用。
```
Promise.resolve(promise()).then(() => {
    ...
})
```
总结一下特点：Promise.resolve的参数如果：
* 不传，返回一个resolved状态的Promise
* 是一个thenable对象（即带有"then"方法)，返回的Promise的状态将在这个对象状态改变时改变，并且与该对象的状态保持一致
* 是普通值，返回一个resolved状态的Promise，该promise的值为这个普通值
* 是一个Promise对象，返回这个对象
```
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
```

## reject方法
reject方法对比resolve相对简单，它总是返回一个reject的promise对象，reject的原因是我们传入的reason

```
  static reject(reason) {
    return new NewPromise((resolve, reject) => {
      reject(reason)
    })
  }
```
## finally方法
返回的是一个promise，作用是在promise结束时，无论结果是fulfilled或者是rejected，都会执行回调函数。返回的新promise的状态和值取决于原来的promise。
```
finally(callback) {
  // 返回值是promise对象，回调在then中执行，也就符合了promise结束后调用的原则
  return this.then(
    // then方法的onFulfiled 和 onRejected都会被传入，保证无论resolved或rejected都会被执行

    // 获取到promise执行成功的结果，将这个结果作为返回的新promise的值
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
```

## all方法
Promise.all(param) 接收一个参数数组，返回一个新的promise实例。当参数数组内的promise都resolve后或者参数内的实例执行完毕后，新返回的promise才会resolve。
数组内任何一个promise失败（rejected），新返回的promise失败，失败原因就是第一个失败的promise的结果。
```
const p1 = Promise.resolve(1),
coint p2 = Promise.resolve(2),
const p3 = Promise.resolve(3);
Promise.all([p1, p2, p3]).then(function (results) {
    console.log(results);  // [1, 2, 3]
});
```
由此可知，all方法需要返回一个新的promise实例，然后根据接收的参数数组执行情况，控制新的promise实例的状态与值
```
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
```
实现之后可以清楚的看到，all方法会并行执行所有promise，结果按传入的promise数组的顺序输出。这让我想起了以前面试碰到的一个题目：
并发所有请求，按顺序输出。可以用Promise.all实现。但实际上会有请求失败的情况，所以更好的方式是下边要讲到的Promise.allSettled。

## allSettled方法
如果说finally提供了在单个promise是否成功都需要执行代码提供了一种方式，那么allSettled就是为多个promise是否成功的场景提供了同样的操作方式。

> Promise.allSettled()方法返回一个promise，该promise在所有给定的promise已被解析或被拒绝后解析，并且每个对象都描述每个promise的结果。

```
const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, 'foo'));
const promises = [promise1, promise2];

Promise.allSettled(promises).
  then((results) => results.forEach((result) => console.log(result.status)));
// expected output:
// "fulfilled"
// "rejected"
```
不同于Promise.all的一旦有一个执行失败，就无法获得所有promise都执行完成的时间点的特点。无论某个promise成功与否，一旦所有的promise都完成，
就可以获得这个时间点。因为其返回的新的promise，总是被resolve的，并且值是所有promise执行结果的描述。
```
[
  {"status":"rejected","reason":"失败"},
  {"status":"fulfiled","value":"成功"}
]
```
要实现它，需要在每个promise执行的时候把结果记录下来放进一个数组内，最后在所有promise执行完成后，resolve结果数组，改变返回的新的promise的状态。
```
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
```

## race方法
与all方法类似，接受一个实例数组为参数，返回新的promise。但区别是一旦实例数组中的某个promise解决或拒绝，返回的promise就会解决或拒绝。
```
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
```

## 完整代码
到此为止就实现了一个相对完整的promise，代码如下：
```
class NewPromise {
  constructor(handler) {
    this.state = PENDING
    this.value = undefined
    this.successCallback = []
    this.failureCallback = []
    try {
      handler(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      // 执行器出现错误需要reject
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
```





