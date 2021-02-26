const add = (x, y, z) => {
  return x + y + z
}
const obj = {
  age: 17,
  add,
}
/*const add = function (x) {
  return function (y) {
    return function (z) {
      return x + y + z
    }
  }
}*/
/*
* 柯里化的意义在于参数收集
* */
function currying(target) {
  return function fn() {
    if (arguments.length < target.length) {
      return fn.bind(null, ...arguments)
    }
    return target.apply(null, arguments)
  }
}

function currying2(target) {
  if (arguments.length - 1 < target.length) {
    return currying2.bind(null, ...arguments)
  }
  return target.apply(null, Array.prototype.slice.call(arguments, 1))
}
const curried = currying2(add)
console.log(curried(1, 2)(3));

/*function f() {
  console.log(arguments);
}
const f2 = f.bind(null, 1)
f2(2)*/
