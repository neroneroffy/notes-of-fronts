/*
* 实现 mergePromise 函数，把传进去的函数数组按顺序先后执行，并且把返回的数据先后放到数组 data 中。
* */
const timeout = ms => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
  }, ms);
});

const ajax1 = () => timeout(2000).then(() => {
  console.log('1');
  return 1;
});

const ajax2 = () => timeout(1000).then(() => {
  console.log('2');
  return 2;
});

const ajax3 = () => timeout(2000).then(() => {
  console.log('3');
  return 3;
});

const mergePromise = ajaxArray => {
  // 在这里实现你的代码
  // reduce实现
  return new Promise(resolve => {
    const data = []
    ajaxArray.reduce((prevPromise, currPromise) => {
      return prevPromise.then(currPromise).then(res => {
        data.push(res)
        if (data.length === ajaxArray.length) {
          resolve(data)
        }
      })
    }, Promise.resolve())
  })

  // promise链实现
/*
  const data = []
  let sequence = Promise.resolve()
  ajaxArray.forEach(item => {
    // item 会作为then的第一个参数，被执行掉
    sequence = sequence.then(item).then(res => {
      data.push(res)
      return data
    })
  })
  return sequence
*/

};

// async await 实现并发执行，按序输出
/*const mergePromise = async ajaxArray => {
  const arr = []
  const promises = ajaxArray.map(ajax => ajax())

  for (const promise of promises) {
    arr.push(await promise)
  }
  return arr
}*/

mergePromise([ajax1, ajax2, ajax3]).then(data => {
  console.log('done');
  console.log(data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]
