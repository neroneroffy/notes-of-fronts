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
    self.apply(this instanceof self ? this : context, args.concat(Array.prototype.slice.call(arguments)))
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

