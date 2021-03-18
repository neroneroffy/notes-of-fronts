## 介绍防抖节流原理，区别，应用场景，手动实现
防抖：持续触发时不触发真正的事件处理函数，等到结束触发一段时间之后，在触发真正的事件处理函数

节流：事件的持续触发不会导致真正的事件处理函数每次都触发，而是在持续出发的过程中固定时间触发一次。

应用场景是input输入框的动态校验

```javascript
// 防抖
function debounce(fn, delay) {
  let timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}

// 节流
function throttle(fn, interval) {
  let run = true
  return function () {
    if (run) {
      run = false
      setTimeout(() => {
        fn.apply(this, arguments)
        run = true
      }, interval)
    } 
  }
}

// 节流时间戳版
function throttle(fn, interval) {
  let prevours = 0
  return function () {
    const now = Date.now()
    if (now - prevours >= interval) {
      fn.apply(this, arguments)
    }
    prevours = now
  }
}
```

## 对闭包的看法，为什么要用闭包，说一下闭包的原理以及应用场景
当一个函数A内部变量被它自己内部的函数所引用，并且外部有办法调用到这个内部函数，那么这个时候垃圾回收机制将不会回收函数A内部的变量，以便让这个内部函数随时可被调用，这就是闭包。

另一种理解：函数引用了不属于它自身作用于的变量，也就是自由变量的时候，产生闭包现象，这个函数就叫做闭包，即引用了自由变量的函数

用闭包可以保存局部变量，避免变量污染全局。

闭包的应用场景有函数的柯里化、私有变量的模拟、

```javascript
// 私有变量的模拟

const uUser = (function () {
  let _password
  class User {
    constructor(username, password) {
      _password = password
      this.username = username
    }
    getUserInfo() {
      console.log(this.username, _password)
    }
  }
})()

let user = new User('nero', 'nero123')
console.log(user.username)
console.log(user.password)
console.log(user._password)
user.getUserInfo()

// nero
// undefined
// undefined
// nero nero123
```