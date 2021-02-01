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
// makeGood()

/*
* 1441. 用栈操作构建数组
给你一个目标数组 target 和一个整数 n。每次迭代，需要从  list = {1,2,3..., n} 中依序读取一个数字。

请使用下述操作来构建目标数组 target ：

Push：从 list 中读取一个新元素， 并将其推入数组中。
Pop：删除数组中的最后一个元素。
如果目标数组构建完成，就停止读取更多元素。
题目数据保证目标数组严格递增，并且只包含 1 到 n 之间的数字。

请返回构建目标数组所用的操作序列。

题目数据保证答案是唯一的。

示例 1：
输入：target = [1,3], n = 3
输出：["Push","Push","Pop","Push"]
解释：
读取 1 并自动推入数组 -> [1]
读取 2 并自动推入数组，然后删除它 -> [1]
读取 3 并自动推入数组 -> [1,3]


示例 2：
输入：target = [1,2,3], n = 3
输出：["Push","Push","Push"]


示例 3：
输入：target = [1,2], n = 4
输出：["Push","Push"]
解释：只需要读取前 2 个数字就可以停止。

* */

const buildArray = function(target, n) {
  const res = []
  const stack = []

  for (let i = 0; i < n; i++) {
    if (stack.length === target.length) return res
    stack.push(i + 1)
    res.push('Push')
    if (stack[stack.length - 1] !== target[stack.length - 1]) {
      res.push('Pop')
      stack.pop()
    }
  }
  return res
};
// console.log(buildArray([1, 3], 3));

/*
* 844. 比较含退格的字符串
给定 S 和 T 两个字符串，当它们分别被输入到空白的文本编辑器后，判断二者是否相等，并返回结果。 # 代表退格字符。

注意：如果对空文本输入退格字符，文本继续为空。


示例 1：
输入：S = "ab#c", T = "ad#c"
输出：true
解释：S 和 T 都会变成 “ac”。

示例 2：
输入：S = "ab##", T = "c#d#"
输出：true
解释：S 和 T 都会变成 “”。

示例 3：
输入：S = "a##c", T = "#a#c"
输出：true
解释：S 和 T 都会变成 “c”。

示例 4：
输入：S = "a#c", T = "b"
输出：false
解释：S 会变成 “c”，但 T 仍然是 “b”。
*
* */

const backspaceCompare = function(S, T) {
  const sStack = []
  const tStack = []

  for (let i = 0; i < S.length; i++) {
    if (S[i] === '#') {
      sStack.pop()
    } else {
      sStack.push(S[i])
    }
  }
  for (let i = 0; i < T.length; i++) {
    if (T[i] === '#') {
      tStack.pop()
    } else {
      tStack.push(T[i])
    }
  }

  if (sStack.join() === tStack.join()) {
    return true
  }
  return false

};
// console.log(backspaceCompare("bxj##tw", "bxo#j##tw"));

const root2 =  {
  val: "1",
  left:  {
    val: "2",
  },
  right: {
    val: "3",
    right: {
      val: "4"
    }
  }
};

/*栈实现二叉树的中序遍历*/

const inorderTraversal = function(root) {
  let cur = root
  const stack = []
  const res = []
  while (cur || stack.length) {
    while (cur) {
      stack.push(cur)
      cur = cur.left
    }
    cur = stack.pop()
    res.push(cur.val)
    cur = cur.right
  }
  return res
};
// console.log(inorderTraversal(root2));

/*
* 921. 使括号有效的最少添加
给定一个由 '(' 和 ')' 括号组成的字符串 S，我们需要添加最少的括号（ '(' 或是 ')'，可以在任何位置），以使得到的括号字符串有效。

从形式上讲，只有满足下面几点之一，括号字符串才是有效的：

它是一个空字符串，或者
它可以被写成 AB （A 与 B 连接）, 其中 A 和 B 都是有效字符串，或者
它可以被写作 (A)，其中 A 是有效字符串。
给定一个括号字符串，返回为使结果字符串有效而必须添加的最少括号数。

示例 1：
输入："())"
输出：1

示例 2：
输入："((("
输出：3

示例 3：
输入："()"
输出：0

示例 4：
输入："()))(("
输出：4
*
* */

const minAddToMakeValid = function(S) {
  if (!S) {
    return 0
  }
  const stack = []

  for (let i = 0; i < S.length; i++) {
    switch (S[i]) {
      case '(':
        stack.push('(')
        break
      case ')':
        if (stack[stack.length - 1] === '(') {
          stack.pop()
        } else {
          stack.push(')')
        }
    }
  }
  return stack.length
};
// console.log(minAddToMakeValid('())'));

/*
* 946. 验证栈序列
给定 pushed 和 popped 两个序列，每个序列中的 值都不重复，只有当它们可能是在最初空栈上进行的推入 push
和弹出 pop 操作序列的结果时，返回 true；否则，返回 false 。


示例 1：
输入：pushed = [1,2,3,4,5], popped = [4,5,3,2,1]
输出：true
解释：我们可以按以下顺序执行：
push(1), push(2), push(3), push(4), pop() -> 4,
push(5), pop() -> 5, pop() -> 3, pop() -> 2, pop() -> 1

示例 2：
输入：pushed = [1,2,3,4,5], popped = [4,3,5,1,2]
输出：false
解释：1 不能在 2 之前弹出。
*
* */
const validateStackSequences = function(pushed, popped) {
  const stack = []
  let j = 0
  for (let i = 0; i < pushed.length; i++) {
    stack.push(pushed[i])
    while (stack[stack.length - 1] === popped[j] && stack.length > 0) {
      stack.pop()
      j++
    }
  }
  return !stack.length
};
console.log(validateStackSequences([1, 2, 3, 4, 5], [4,5,3,2,1]));


/*
* 503. 下一个更大元素 II
给定一个循环数组（最后一个元素的下一个元素是数组的第一个元素），输出每个元素的下一个更大元素。数字 x 的下一个更大的元素是按数组遍历顺序，这个数字之后的第一个比它更大的数，这意味着你应该循环地搜索它的下一个更大的数。如果不存在，则输出 -1。

示例 1:

输入: [1,2,1]
输出: [2,-1,2]
解释: 第一个 1 的下一个更大的数是 2；
数字 2 找不到下一个更大的数；
第二个 1 的下一个最大的数需要循环搜索，结果也是 2。
注意: 输入数组的长度不会超过 10000。
*
* */

const nextGreaterElements = function(nums) {
  const result = []
  const totalNums = nums.concat(nums)
  for (let i = 0, j = 1; i < totalNums.length; i++, j = i + 1) {
    let cur = nums[i]
    while (j < totalNums.length) {

      if (cur < totalNums[j]) {
        cur = totalNums[j]
        j++
      } else {
        cur = -1
      }
    }
    result.push(cur)
  }
  return result
};
console.log(nextGreaterElements([1, 2, 1]));
