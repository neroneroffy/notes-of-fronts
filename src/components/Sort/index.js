/*
* 快速排序就是取一个中间值将数组划分成两部分：比中间值大的分到右边，小的分到左边，得到左右两个数组。
* 这三部分的顺序是 左 < 中间值 < 右。再按照顺序连接起来。
* 然后再分别对左和右这两个数组重复以上的过程。直到数组长度小于等于1。
* 整个排序类似一个二分的过程，将二分好的结果再不断二分。
* */

const arr = [ 5, 6, 67, 12, 4, 9, 23, 1098, 34 ]
const quick = arr => {
  let left = []
  let right = []
  if (arr.length <= 1) return arr
  const middleIndex = Math.floor(arr.length / 2)
  const middle = arr.splice(middleIndex, 1)
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < middle) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }
  return quick(left).concat(middle, quick(right))
}

/*冒泡排序*/
const bubbleSort = arr => {
  for (let i = 0; i < arr.length; i++) {
    for (let k = 0; k < arr.length - 1; k++) {
      if (arr[k] < arr[i]) {
        let temp = arr[k]
        arr[k] = arr[i]
        arr[i] = temp
      }
    }
  }
  return arr
}

/*归并排序*/
const merge = (left, right) => {
  const result = []
  while (left.length > 0 && right.length > 0) {
    if (left[0] < right[0]) {
      result.push(left.shift())
    } else {
      result.push(right.shift())
    }
  }
  return result.concat(left).concat(right)
}

const mergeSort = arr => {
  if (arr.length === 1) return arr
  const middle = Math.floor(arr.length / 2)
  const left = arr.slice(0, middle)
  const right = arr.slice(middle)
  return merge(mergeSort(left), mergeSort(right))
}

mergeSort(arr)

