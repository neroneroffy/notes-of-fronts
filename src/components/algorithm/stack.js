/*
* 题目描述：给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。
* 有效字符串需满足： 左括号必须用相同类型的右括号闭合。
左括号必须以正确的顺序闭合。
注意空字符串可被认为是有效字符串。
示例 4:
输入: "([)]"
输出: false
示例 5:
输入: "{[]}"
输出: true
* */
function validParenthesis(str) {
  const arr = []
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        arr.push(str[i])
        break
      case '[':
        arr.push(str[i])
        break
      case '{':
        arr.push(str[i])
        break
      case ')':
        if (arr.pop() !== '(') {
          return false
        }
        continue
      case ']':
        if (arr.pop() !== '[') {
          return false
        }
        continue
      case '}':
        if (arr.pop() !== '{') {
          return false
        }
    }
  }
  if (!arr.length) {
    return true
  } else {
    return false
  }
}

// console.log(validParenthesis('({[])'));

/*
* 题目描述: 根据每日气温列表，请重新生成一个列表，
* 对应位置的输出是需要再等待多久温度才会升高超过该
* 日的天数。如果之后都不会升高，请在该位置用 0 来代替。

例如，给定一个列表
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]，
你的输出应该是    [1,  1,  4,  2,  1,  1,  0,  0]。
* */
function printDays() {
  const temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
  // 双指针法，以slow为遍历数组的指针，fast为前导，比较T[fast]和T[slow]。
  // slow表示当日温度，fast表示未来日温度
  // 最开始假设再有1天就能升高温度。
  // 声明结果数组result
  // 若T[fast] > T[slow]，result存入slow和slow的差值，表明天数。
  // 若T[fast] <= T[slow]，说明未来日的温度不高于当前日温度，fast加1，slow不动。
  // 若T[fast]不存在，说明遍历fast到头了，也没有温度高于当日温度的，result存入0，然后fast设置为slow。
  function func(temperatures) {
    if (!temperatures.length) {
      return []
    }
    if (temperatures.length === 1) {
      return [ 0 ]
    }
    let slow = 0
    let fast = slow + 1
    const result = []
    for (; slow < temperatures.length;) {
      if (temperatures[fast] > temperatures[slow]) {
        result.push(fast - slow)
        slow++
        fast = slow + 1
      } else if(!temperatures[fast]) {
        slow++
        fast = slow
        result.push(fast - slow)
      } else {
        fast++
      }
    }
    return result
  }

  const funcStack = function(T) {
    const len = T.length // 缓存数组的长度
    const stack = [] // 初始化一个栈
    const res = (new Array(len)).fill(0) //  初始化结果数组，注意数组定长，占位为0
    for(let i=0;i<len;i++) {
      // 若栈不为0，且存在打破递减趋势的温度值
      while(stack.length && T[i] > T[stack[stack.length-1]]) {
        // 将栈顶温度值对应的索引出栈
        const top = stack.pop()
        // 计算 当前栈顶温度值与第一个高于它的温度值 的索引差值
        res[top] = i - top
      }
      // 注意栈里存的不是温度值，而是索引值，这是为了后面方便计算
      stack.push(i)
    }
    // 返回结果数组
    return res
  };

  function stackWay(T) {
    const len = T.length
    const stack = []
    const res = new Array(len).fill(0)

    for (let i = 0; i < len; i++) {
      while (stack.length && T[i] > T[stack[i] - 1]) {
        const val = stack.pop()
        res[i] = val
      }
      stack.push(T[i])
    }
    return res
  }
  console.log(func(temperatures));
}
// printDays()

const nums = [0,1,2,3,4], index = [0,1,2,2,1]
var createTargetArray = function(nums, index) {
  const target = []
  while (index.length > 0 && nums.length > 0) {
    const current = index.unshift()
    const value = nums.unshift()
    target[current] = value
  }
  return target
};
// console.log(createTargetArray(nums, index));

/*
* 如何用栈实现一个队列？
* 题目描述：使用栈实现队列的下列操作：
  push(x) -- 将一个元素放入队列的尾部。
  pop() -- 从队列首部移除元素。
  peek() -- 返回队列首部的元素。
  empty() -- 返回队列是否为空。

  示例: MyQueue queue = new MyQueue();
  queue.push(1);
  queue.push(2);
  queue.peek(); // 返回 1
  queue.pop(); // 返回 1
  queue.empty(); // 返回 false

  说明:

  你只能使用标准的栈操作 -- 也就是只有 push to top, peek/pop from top, size, 和 is empty 操作是合法的。
  你所使用的语言也许不支持栈。你可以使用 list 或者 deque（双端队列）来模拟一个栈，只要是标准的栈操作即可。
  假设所有操作都是有效的 （例如，一个空的队列不会调用 pop 或者 peek 操作）。
* */
class MyQueue {
  constructor() {
    this.stack1 = []
    this.stack2 = []
  }
  push(value) {
    return this.stack1.push(value)
  }
  pop() {
    while (this.stack2.length <= 0) {
      while (this.stack1.length) {
        this.stack2.push(this.stack1.pop())
      }
    }
    return this.stack2.pop()
  }
  peek() {
    while (this.stack2.length <= 0) {
      while (this.stack1.length) {
        this.stack2.push(this.stack1.pop())
      }
    }
    return this.stack2[this.stack2.length - 1]
  }
  empty() {
    return !this.stack2.length && !this.stack2.length
  }
}

// const queue = new MyQueue()
// queue.push(1)
// queue.push(2)
// console.log(queue.pop(), queue.peek(), queue.empty(), queue.stack2)

/*
* 滑动窗口问题
* 题目描述：给定一个数组 nums 和滑动窗口的大小 k，请找出所有滑动窗口里的最大值。
* 示例: 输入: nums = [1,3,-1,-3,5,3,6,7], 和 k = 3 输出: [3,3,5,5,6,7]
*
* 解释: 滑动窗口的位置
  ---------------
  [1 3 -1] -3 5 3 6 7
  1 [3 -1 -3] 5 3 6 7
  1 3 [-1 -3 5] 3 6 7
  1 3 -1 [-3 5 3] 6 7
  1 3 -1 -3 [5 3 6] 7
  1 3 -1 -3 5 [3 6 7]

  最大值分别对应：
  3 3 5 5 6 7

  提示：你可以假设 k 总是有效的，在输入数组不为空的情况下，1 ≤ k ≤ 输入数组的大小。
* */
function calculateMax() {
  const arr = [1,3,-1,-3,5,3,6,7]
  const k = 3

  /*function func(nums, k) {
    function max(list) {
      let maxNumber = list[0]
      for (let i = 0; i <= list.length; i++) {
        if (list[i] > maxNumber) {
          maxNumber = list[i]
        }
      }
      return maxNumber
    }
    let left = 0, right = k
    const result = []
    for (; right <= nums.length;) {
      const temp = nums.slice(left, right)
      console.log(temp);
      result.push(max(temp))
      left++
      right++
    }
    return result
  }*/

  function func(nums, k) {
    const queue = []
    const result = []
    let left = 0
    let right = k
    while (right < nums.length) {
      if (nums[left] > queue[0]) {
        queue.unshift()
        queue.push(nums[left])
      } else {
        queue.push(nums[left])
      }
      right++
      left++
      if (left % k === 0) {
        result.push(queue[0])
      }
    }
    return result
  }

  console.log(func(arr, k));
}
// calculateMax()

function minStack() {
  var MinStack = function() {
    this.stack = []
    this.minStack = []
  };

  /**
   * @param {number} x
   * @return {void}
   */
  MinStack.prototype.push = function(x) {
    this.stack.push(x)
    if (!this.minStack.length || this.minStack[this.minStack.length - 1] > x) {
      this.minStack.push(x)
    } else {
      const len = this.minStack.length
      this.minStack[len] = this.minStack[len - 1]
    }
  };

  /**
   * @return {void}
   */
  MinStack.prototype.pop = function() {
    this.stack.pop()
    this.minStack.pop()
  };

  /**
   * @return {number}
   */
  MinStack.prototype.top = function() {
    return this.stack[this.stack.length - 1]
  };

  /**
   * @return {number}
   */
  MinStack.prototype.getMin = function() {
    return this.minStack[this.minStack.length - 1]
  };
}

/*
*
* 给你一个由大小写英文字母组成的字符串 s 。

一个整理好的字符串中，两个相邻字符 s[i] 和 s[i+1]，其中 0<= i <= s.length-2 ，要满足如下条件:

若 s[i] 是小写字符，则 s[i+1] 不可以是相同的大写字符。
若 s[i] 是大写字符，则 s[i+1] 不可以是相同的小写字符。
请你将字符串整理好，每次你都可以从字符串中选出满足上述条件的 两个相邻 字符并删除，直到字符串整理好为止。

请返回整理好的 字符串 。题目保证在给出的约束条件下，测试样例对应的答案是唯一的。

注意：空字符串也属于整理好的字符串，尽管其中没有任何字符。

 

示例 1：

输入：s = "leEeetcode"
输出："leetcode"
解释：无论你第一次选的是 i = 1 还是 i = 2，都会使 "leEeetcode" 缩减为 "leetcode" 。
示例 2：

输入：s = "abBAcC"
输出：""
解释：存在多种不同情况，但所有的情况都会导致相同的结果。例如：
"abBAcC" --> "aAcC" --> "cC" --> ""
"abBAcC" --> "abBA" --> "aA" --> ""
示例 3：

输入：s = "s"
输出："s"

* */





















function makeGood() {
  function fn(s) {
    if (!s || s.length === 1) {
      return s
    }
    let stack = []
    for (let i = 0; i <= s.length - 1; i++) {
      const top = stack[stack.length - 1]
      if (top && s[i] !== top && top.toLowerCase() === s[i].toLowerCase()) {
        stack.pop()
      } else {
        stack.push(s[i])
      }
    }
    return stack.join('')
  }
  const s = 'leEeetcode'
  console.log(fn(s));
}
makeGood()
