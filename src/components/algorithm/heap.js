//

/*
* 对于索引为 n 的结点来说：

索引为 (n-1)/2 的结点是它的父结点
索引 2*n+1 的结点是它的左孩子结点
索为引 2*n+2 的结点是它的右孩子结点
* */

const heap = [9, 8, 6, 3, 1]
// 取出栈顶元素后，重新排列堆
const downHeap = (low, high) => {
  let i = low, j = i * 2 + 1

  while (j < high) {
    if (j + 1 < high && heap[j] < heap[j + 1]) {
      j = j + 1
    }
    if (heap[i] < heap[j]) {
      [ heap[i], heap[j] ] = [ heap[j], heap[i] ]
      i = j
      j = j * 2 + 1
    } else {
      break
    }
  }

}