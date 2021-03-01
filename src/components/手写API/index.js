// new 创建一个对象，关联原型，执行构造函数，依据执行结果被返回不同的值
function newFactory() {
  const object = new Object()
  const constructor = Array.prototype.shift.apply(arguments)
  object.__proto__ = constructor.prototype
  const res = constructor.apply(object, arguments)

  return typeof res === 'object' ? res : object
}
function Fruit(type, color) {
  this.type = type
  this.color = color
}
const apple = newFactory(Fruit, 'apple', 'red')

// apply
Function.prototype.newApply = function (context, args) {
  const target = context || window
  if (typeof this !== 'function') {
    throw new Error('must invoke with function')
  }
  target.fn = this
  target.fn(...args)

  delete target.fn
}

// call
Function.prototype.newCall = function (context, ...args) {
  const target = context || window
  if (typeof this !== 'function') {
    throw new Error('must be invoked with function')
  }
  target.fn = this
  target.fn(...args)
  delete target.fn
}
const targetObj = {
  age: 18
}

// bind
Function.prototype.newBind = function (context, ...args) {
  const self = this
  const target = context || window
  if (typeof self !== 'function') {
    throw new Error('must be invoked with function')
  }
  const fbound = function () {
    self.apply(this instanceof self ? this : target, args.concat(Array.prototype.slice.call(arguments)))
  }
  if (this.prototype) {
    fbound.prototype = Object.create(this.prototype)
  }
  return fbound
}
function testApplyOrCallOrBind(a, b) {
  console.log(a, b, this.age)
}
testApplyOrCallOrBind.newApply(targetObj, [1, 2])
testApplyOrCallOrBind.newCall(targetObj, 1, 2)
const binded = testApplyOrCallOrBind.newBind(targetObj, 1, 2)
binded()


// 防抖
function debounce(fn, delay) {
  let timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.call(this, Array.prototype.slice.apply(arguments))
    }, delay)
  }
}

// 节流
function throttle(fn, interval) {
  let run = true
  return function () {
    if (!run) {
      return
    }
    run = false
    const self = this
    const args = arguments
    setTimeout(function () {
      fn.apply(self, args)
      run = true
    }, interval)
  }
}

const mouseContainer = document.getElementById('mouse-container')
const mouseMoveFn = function (e) {
  console.log('moving', this, e);
}
mouseContainer.onmousemove = throttle(mouseMoveFn, 1000)

// 深拷贝

function deepClone(obj) {
  let result = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      result[key] = deepClone(obj[key])
    } else {
      result[key] = obj[key]
    }
  }
  return result
}

// EventEmitter
class EventEmitter {
  constructor() {
    this._events = new Map()
  }
}
EventEmitter.prototype.on = function (type, listener, flag) {
  if (!this._events) {
    this._events = Object.create(null)
  }
  const handlers = this._events.get(type)

  if (handlers) {
    if (flag) {
      handlers.unshift(listener)
    } else {
      handlers.push(listener)
    }
  } else {
    this._events.set(type, [ listener ])
  }
}
EventEmitter.prototype.emit = function (type, ...args) {
  const handlers = this._events.get(type)
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i](...args)
    }
  }
}
EventEmitter.prototype.off = function (type, fn) {
  const handlers = this._events.get(type)
  if (handlers) {
    let matchedPosition = -1
    for (let i = 0; i < handlers.length; i++) {
      if (fn === handlers[i] || fn === handlers[i].origin) {
        matchedPosition = i
        break
      }
    }
    handlers.splice(matchedPosition, 1)
  }
}
EventEmitter.prototype.once = function (type, listener) {
  const self = this
  function only() {
    listener()
    self.off(type, only)
  }
  // 方便off时比对，当只正好off listeners时，保证它也可以被off掉
  only.origin = listener
  self.on(type, only)
}

const event = new EventEmitter()
function callRun() {
  console.log('running')
}

event.once('run', callRun)
console.log(event._events);
event.emit('run')
event.emit('run')
console.log(event._events);
