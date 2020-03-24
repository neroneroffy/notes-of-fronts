JS数组Reduce方法详解

## 概述
一直以来都在函数式编程的大门之外徘徊，要入门的话首先得熟悉各种高阶函数，数组的reduce方法就是其中之一。

reduce方法将会对数组元素从左到右依次执行reducer函数，然后返回一个累计的值。举个形象的例子：你要组装一台电脑，买了主板、CPU、显卡、内存、硬盘、电源...这些零件是组装电脑的必要条件。
装的过程可以简单概括为拆掉每个零件的包装，再装到一起。类比一下reduce函数就可以明白了，那些零件就相当于要执行reduce方法的数组，对每个零件执行拆除包装的加工程序，
就是对数组的每个元素执行reducer函数，把这些零件装到一起，就相当于reduce方法的任务，最终组装好的电脑相当于reduce方法的返回值。

reduce方法接收两个参数，第一个参数是回调函数reducer，第二个参数是初始值。reducer函数接收四个参数：
* Accumulator：MDN上解释为累计器，但我觉得不恰当，按我的理解它应该是截至当前元素，之前所有的数组元素被reducer函数处理累计的结果
* Current：当前被执行的数组元素
* CurrentIndex: 当前被执行的数组元素索引
* SourceArray：原数组，也就是调用reduce方法的数组

如果传入第二个参数，reduce方法会在这个参数的基础上开始累计执行。

概念讲了那么多，那reduce它的执行机制是怎样的呢？别着急，从用法入手一点一点分析

来个最好理解的例子：数组求和
```
    const arr = [1, 2, 3, 4]
    const accumulator = (total, current, currentIndex, arr) => {
      console.log(total, current, currentIndex, arr);
      return total + current
    }
    console.log(arr.reduce(accumulator))
```
执行结果如下：

![img](http://neroht.com/1.png)

很明确，最终的结果就是把所有数组的元素都加起来。值得注意的是，它将数组的第一个元素作为累加的初始值，然后再依次对后边的元素执行reducer函数。
总共执行了三次，得出最终结果。那如果传入初始值，是怎样的执行顺序？
```
console.log(arr.reduce(accumulator, 3))
```
结果如下：

![img](http://neroht.com/2.jpg)

这次是以传入的初始值作为累加的起点，然后依次对数组的元素执行reducer。

假设对没有初始值的空数组调用reduce方法，则会报错：
```
Uncaught TypeError: Reduce of empty array with no initial value
```

## 一些用法

讲了一些概念，但使用场景更重要，下面来看一下reduce方法都会有哪些用途。

### compose函数
compose是函数式编程的一种形式，用于将多个函数合并，上一个函数的返回值作为当前函数的入参，当前函数的返回值再作为下一个函数的入参，这样的效果
有点类似于koa中间件的洋葱模型。
`[a, b, c, d]` => a(b(c(d())))

实际上和累加差不多，只不过把累加操作变成了入参执行，相加的结果变成了执行的返回值。以redux的applyMiddleware内就使用了compose，
目的是保证最终的dispatch是被所有中间件处理后的结果。

下面来以applyMiddleware中的compose为例，先看用法：
```
const result = compose(a, b, c)(params)
```
执行情况是这样：
```
(params) => a(b(c(params)))
```
返回的是一个函数，将params作为该函数的入参，被右侧第一个函数执行，执行顺序是从右到左执行，其余的函数的参数都是上一个函数的返回值。

看一下实现：
```
function compose(...funcs) {
  // funcs是compose要组合的那些函数，arg是componse返回的函数的参数
  if (funcs.length === 0) {
    // 如果没有传入函数，那么直接返回一个函数，函数的返回值就是传进来的参数
    return arg => arg
  }
  if (funcs.length === 1) {
    // 如果只传入了一个函数，直接返回这个函数
    return funcs[0]
  }

  return funcs.reduce((all, current) => {
    return (...args) => {
      return all(current(...args))
    }
  })
}
```


### 扁平化数组
```
const array = [[0, 1], [2, 3], [4, 5]]
const flatten = arr => {
  return arr.reduce((a, b) => {
    return a.concat(b)
  }, [])
}
console.log(flatten(array)); // [0, 1, 2, 3, 4, 5]
```
来看一下执行过程，
* 第一次执行，初始值传入`[]`，走到reduce的回调里，参数a就这个`[]`，参数b是数组第一项`[0, 1]`，回调内`[].cancat([0, 1])`
* 第二次执行，reduce的回调参数a是上一次回调执行的结果`[0, 1]`，本次继续用它来concat数组的第二项`[2, 3]`，得到结果`[0, 1, 2, 3]`作为下一次回调执行的参数a继续执行下去
* ...以此类推

那么假设数组是这样呢？`[[0, [111, 222], 1], [2, [333, [444, 555]], 3], [4, 5]]`，其实加个递归调用就可以
```
const array = [[0, [111, 222], 1], [2, [333, [444, 555]], 3], [4, 5]]

const flatten = arr => {
  return arr.reduce((a, b) => {
    if (b instanceof Array) {
      return a.concat(flatten(b))
    }
    return a.concat(b)
  }, [])
}
console.log(flatten(array)); // [0, 111, 222, 1, 2, 333, 444, 555, 3, 4, 5]
```

### 统计字符串中每个字符出现的次数
每次回调执行的时候，都会往对象中加一个key为字符串，value为出现次数的键值，若已经存储过字符串，那么它的value加1
```
const str = 'adefrfdnnfhdueassjfkdiskcddfjds'
const arr = str.split('')
const strObj = arr.reduce((all, current) => {
  if (current in all) {
    all[current]++
  } else {
    all[current] = 1
  }
  return all
}, {})

console.log(strObj) // {"a":2,"d":7,"e":2,"f":5,"r":1,"n":2,"h":1,"u":1,"s":4,"j":2,"k":2,"i":1,"c":1}
```

### 数组去重
```
const arr = ['1', 'a', 'c', 'd', 'a', 'c', '1']
const afterUnique = arr.reduce((all, current) => {
  if (!all.includes(current)) {
    all.push(current)
  }
  return all
}, [])
console.log(afterUnique); //  ["1", "a", "c", "d"]
```

### 按照顺序调用promise
这种方式实际上处理的是promise的value，将上一个promise的value作为下一个promise的value进行处理
```
const prom1 = a => {
  return new Promise((resolve => {
    resolve(a)
  }))
}
const prom2 = a => {
  return new Promise((resolve => {
    resolve(a * 2)
  }))
}
const prom3 = a => {
  return new Promise((resolve => {
    resolve(a * 3)
  }))
}

const arr = [prom1, prom2, prom3]
const result = arr.reduce((all, current) => {
  return all.then(current)
}, Promise.resolve(10))

result.then(res => {
  console.log(res);
})
```

## 实现
通过上面的用法，可以总结出来reduce的特点：
* 接收两个参数，第一个为函数，函数内会接收四个参数：Accumulator Current CurrentIndex SourceArray，第二个参数为初始值。
* 返回值为一个所有Accumulator累计执行的结果

```
  Array.prototype.myReduce = function(fn, base) {
    if (this.length === 0 && !base) {
      throw new Error('Reduce of empty array with no initial value')
    }
    for (let i = 0; i < this.length; i++) {
      if (!base) {
        base = fn(this[i], this[i + 1], i, this)
        i++
      } else {
        base = fn(base, this[i], i, this)
      }
    }
    return base
  }
```

