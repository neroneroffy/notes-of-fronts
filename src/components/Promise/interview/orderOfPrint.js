const promise = new Promise((resolve, reject) => {
  console.log(1)
  resolve()
  console.log(2)
})
promise.then(() => {
  console.log(3)
})
console.log(4)
// 1 2 4 3


const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
const promise2 = promise1.then(() => {
  throw new Error('error!!!')
})

console.log('promise1', promise1)
console.log('promise2', promise2)

setTimeout(() => {
  console.log('promise1', promise1)
  console.log('promise2', promise2)
}, 2000)

// promise1 pending
// promise2 pending
// promise1 fulfilled
// promise2 rejected


const promise = new Promise((resolve, reject) => {
  resolve('success1')
  reject('error')
  resolve('success2')
})

promise
  .then((res) => {
    console.log('then: ', res)
  })
  .catch((err) => {
    console.log('catch: ', err)
  })
// success1

Promise.resolve(1)
  .then((res) => {
    console.log(res)
    return 2
  })
  .catch((err) => {
    return 3
  })
  .then((res) => {
    console.log(res)
  })
// 1 2

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('once')
    resolve('success')
  }, 1000)
})

const start = Date.now()
promise.then((res) => {
  console.log(res, Date.now() - start)
})
promise.then((res) => {
  console.log(res, Date.now() - start)
})
// once
// success  1000
// success  1000

Promise.resolve()
  .then(() => {
    return new Error('error!!!')
  })
  .then((res) => {
    console.log('then: ', res)
  })
  .catch((err) => {
    console.log('catch: ', err)
  })
/*
then: Error: error!!!
  at Promise.resolve.then (...)
at ...
*/

const promise = Promise.resolve()
  .then(() => {
    return promise
  })
promise.catch(console.error)
// Type Error


Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
// 1


Promise.resolve()
  .then(function success (res) {
    throw new Error('error')
  }, function fail1 (e) {
    console.error('fail1: ', e)
  })
  .catch(function fail2 (e) {
    console.error('fail2: ', e)
  })
// fail2: error

process.nextTick(() => {
  console.log('nextTick')
})
Promise.resolve()
  .then(() => {
    console.log('then')
  })
setImmediate(() => {
  console.log('setImmediate')
})
console.log('end')
// end nextTick then setImmediate

var p = new Promise(function(resolve, reject){
  resolve(1);
});
p.then(function(value){               //第一个then
  console.log(value);
  return value*2;
}).then(function(value){              //第二个then
  console.log(value);
}).then(function(value){              //第三个then
  console.log(value);
  return Promise.resolve('resolve');
}).then(function(value){              //第四个then
  console.log(value);
  return Promise.reject('reject');
}).then(function(value){              //第五个then
  console.log('resolve: '+ value);
}, function(err){
  console.log('reject: ' + err);
})
// 1 2 undefind resolve reject: reject

var p1 = new Promise( function(resolve,reject){
  foo.bar();
  resolve( 1 );
});

p1.then(
  function(value){
    console.log('p1 then value: ' + value);
  },
  function(err){
    console.log('p1 then err: ' + err);
  }
).then(
  function(value){
    console.log('p1 then then value: '+value);
  },
  function(err){
    console.log('p1 then then err: ' + err);
  }
);

var p2 = new Promise(function(resolve,reject){
  resolve( 2 );
});

p2.then(
  function(value){
    console.log('p2 then value: ' + value);
    foo.bar();
  },
  function(err){
    console.log('p2 then err: ' + err);
  }
).then(
  function(value){
    console.log('p2 then then value: ' + value);
  },
  function(err){
    console.log('p2 then then err: ' + err);
    return 1;
  }
).then(
  function(value){
    console.log('p2 then then then value: ' + value);
  },
  function(err){
    console.log('p2 then then then err: ' + err);
  }
);

// p1 then err: foo is not defined
// p2 then value: 2
// p1 then then value: undefind
// p2 then then err: foo is not defined
// p2 then then then value: 1

var p1 = Promise.resolve( 1 );
var p2 = Promise.resolve( p1 );
var p3 = new Promise(function(resolve, reject){
  resolve(1);
});
var p4 = new Promise(function(resolve, reject){
  resolve(p1);
});

console.log(p1 === p2);
console.log(p1 === p3);
console.log(p1 === p4);
console.log(p3 === p4);

p4.then(function(value){
  console.log('p4=' + value);
});

p2.then(function(value){
  console.log('p2=' + value);
})

p1.then(function(value){
  console.log('p1=' + value);
})

/*
* Promise.resolve(...)可以接收一个值或者是一个Promise对象作为参数。
当参数是普通值时，它返回一个resolved状态的Promise对象，对象的值就是这个参数；当参数是一个Promise对象时，它直接返回这个Promise参数

另外，为什么p4的then最先调用，但在控制台上是最后输出结果的呢？
因为p4的resolve中接收的参数是一个Promise对象p1，resolve会对p1”拆箱“，获取p1的状态和值，但这个过程是异步的，可参考下一节。
* */

// true
// false
// false
// false

// p2=1
// p1=1
// p4=1


var p1 = new Promise(function(resolve, reject){
  resolve(Promise.resolve('resolve'));
});

var p2 = new Promise(function(resolve, reject){
  resolve(Promise.reject('reject'));
});

var p3 = new Promise(function(resolve, reject){
  reject(Promise.resolve('resolve'));
});

p1.then(
  function fulfilled(value){
    console.log('fulfilled: ' + value);
  },
  function rejected(err){
    console.log('rejected: ' + err);
  }
);

p2.then(
  function fulfilled(value){
    console.log('fulfilled: ' + value);
  },
  function rejected(err){
    console.log('rejected: ' + err);
  }
);

p3.then(
  function fulfilled(value){
    console.log('fulfilled: ' + value);
  },
  function rejected(err){
    console.log('rejected: ' + err);
  }
);

/*
p3 rejected: \[object Promise\]
p1 fulfilled: resolve
p2 rejected: reject
*/
/*
* Promise回调函数中的第一个参数resolve，会对Promise执行"拆箱"动作。
即当resolve的参数是一个Promise对象时，resolve会"拆箱"获取这个Promise对象的状态和值，但这个过程是异步的。
p1"拆箱"后，获取到Promise对象的状态是resolved，因此fulfilled回调被执行；p2"拆箱"后，获取到Promise对象的状态是rejected，因此rejected回调被执行。
但Promise回调函数中的第二个参数reject不具备”拆箱“的能力，reject的参数会直接传递给then方法中的rejected回调。
因此，即使p3 reject接收了一个resolved状态的Promise，then方法中被调用的依然是rejected，并且参数就是reject接收到的Promise对象。
* */
