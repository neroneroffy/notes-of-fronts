Function.prototype.newApply = function (context, args) {
  const target = context || window
  context.func = this
  context.func(...args)
  delete context.func
}
