const reduceExp = () => {
  /*
  * reduce方法接收两个参数，第一个参数是回调函数reducer，第二个参数是初始值
  * reducer函数接收四个参数，
  *
  * reduce方法将会对数组元素从左到右依次执行reducer函数，然后返回一个累计的值
  * 举个形象的例子：你要组装一台电脑，买了主板、CPU、显卡、内存、硬盘、电源...
  * 这些零件是组装电脑的必要条件。装的过程可以简单概括为拆掉每个零件的包装，再装到一起。
  * 类比一下reduce函数就可以明白了，那些零件就相当于要执行reduce方法的数组，对每个零件执行拆除包装的加工程序，
  * 就是对数组的每个元素执行reducer函数，把这些零件装到一起，就相当于reduce方法的任务，最终组装好的电脑相当于reduce方法的返回值
  *
  * 那么下边来个最好理解的例子：数组求和
  *
  * */
  const normal = () => {
    const arr = [1, 2, 3, 4]
    const accumulator = (total, current, currentIndex, arr) => {
      console.log('累加于' + total, '累加到当前元素' + current, '当前元素的索引' + currentIndex, '源数组' + JSON.stringify(arr));
      return total + current
    }
    console.log('最终值' + arr.reduce(accumulator))
  }
  normal()

  const flattened = () => {
    const array = [[0, [111, 222], 1], [2, [333, [444, 555]], 3], [4, 5]]
    const flatten = arr => {
      return arr.reduce((a, b) => {
        if (b instanceof Array) {
          return a.concat(flatten(b))
        }
        return a.concat(b)
      }, [])
    }
    console.log(flatten(array));
  }
  console.log(flattened());

  const maxStr = () => {
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
    let max = {key: '', times: 0}
    for(const k in strObj) {
      if (strObj[k] > max.times) {
        max.times = strObj[k]
        max.key = k
      }
    }
    console.log(JSON.stringify(strObj), max);
  }
  maxStr()

  const unique = () => {
    const arr = ['1', 'a', 'c', 'd', 'a', 'c', '1']
    const afterUnique = arr.reduce((all, current) => {
      if (!all.includes(current)) {
        all.push(current)
      }
      return all
    }, [])
    console.log(afterUnique);
  }
  unique()

  const promiseCallInOrder = () => {
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
  }
  promiseCallInOrder()

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
  const arr = [1, 2, 3]
  console.log('自己实现的2', arr.myReduce((all, current) => {
    console.log(all, current);
    return all + current
  }));
}

export default reduceExp
