function newNew() {
  const obj = {}
  const constructor = Array.prototype.shift.call(arguments)
  const res = constructor.call(obj, ...arguments)
  obj.__proto__ = constructor.prototype
  return Object.toString.call(res) === '[object Object]' ? res : obj
}
Function.prototype._apply = function (target, ...args) {
  if (typeof target !== 'function') {
    throw new Error('must be function')
  }
  const context = target || window
  context.fn = this
  context.fn(...args)
  delete context.fn
}

function debounce(fn, delay) {
  let timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, ...arguments)
    }, delay)
  }
}
