
function newFactory() {
  const obj = {}
  const constructor = Array.prototype.shift.call(arguments)
  obj.__proto__ = constructor.prototype

  const res = constructor.apply(obj, arguments)
  return typeof res === 'object' ? res : obj
}

Function.prototype.newApply = function (context, args) {
  if (typeof this !== 'function') {
    throw new Error('must be called in function')
  }
  context = context || window
  try {
    context.fn = this
    context.fn(...args)
    delete context.fn
  } catch (e) {
    throw new Error('oops')
  }
}

Function.prototype.newCall = function (context, ...args) {
  if (typeof this !== 'function') {
    throw new Error('must be called in function')
  }
  context = context || window
  try {
    context.fn = this
    context.fn(...args)
    delete context.fn
  } catch (e) {

  }
}
function newBind(context, ...args) {
  const target = context || window
  const self = this

  function fBound() {
    target.apply(this instanceof self ? this : target, [...args, Array.prototype.slice.call(arguments)])
  }
  if (this.prototype) {
    fBound.__proto__ = Object.create(this.prototype)
  }
  return fBound
}

function debounce(fn, delay) {
  let timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.call(this, ...arguments)
    }, delay)
  }
}

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

