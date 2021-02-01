Function.prototype.newCall = function (context, ...args) {
  const target = context || window
  target.func = this
  target.func(...args)

  delete target.func
}
