function maxDepth() {
  const s = "(1+(2*3)+((8)/4))+1"
  function fn(s) {
    let depth = 0
    let res = 0
    for (let i = 0; i < s.length; i++) {
      switch (s[i]) {
        case '(':
          depth++
          break
        case ')':
          depth--
          break
        default:
      }
      res = res > depth ? res : depth
    }

    return res
  }
  console.log(fn(s))
}
// maxDepth()

function sumOddLengthSubarrays() {
  const arr = [1,4,2,5,3]
  function fn(arr) {
    let sum = 0
    for (let step = 1; step <= arr.length; step += 2) {
      for (let j = 0; j + step <= arr.length; j++) {
        sum += arr.slice(j, j + step).reduce((acc, cur) => {
          return acc + cur
        }, 0)
      }
    }
    return sum
  }

  console.log(fn(arr));
}
// sumOddLengthSubarrays()

function numberOfSteps() {
  const num = 14
  function fn(num) {
    let remain = num
    let res = 0
    while (remain > 0) {
      res++
      const remainder = remain % 2
      if (remainder === 0) {
        remain = remain / 2
      } else {
        remain--
      }
    }
    return res
  }

  console.log(fn(num));
}
// numberOfSteps()

function smallerNumbersThanCurrent() {
  const nums = [8,1,2,2,3]
  function fn(nums) {
    const res = []
    const map = {}
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] > nums[i + 1]) {
        map[nums[i]] = map[nums[i]] ? 1 : map[nums[i]]++
      }
    }
    return map
  }

  console.log(fn(nums));
}
// smallerNumbersThanCurrent()

function balancedStringSplit() {
  const s = "LLLLRRRR"
  // 举例： L入栈，那么就是R出栈，由于入栈出栈操作的对称性和平衡字符串的要求相同，所以当栈为空的时候，符合要求，计一次数。

  // 最开始无论如何都需要先入栈一次，由于无法具体确定谁入栈谁出栈，所以最开始将s[0]设为需要入栈的元素（inFlag），入栈元素一旦确定，出栈元素也确定了。
  // 当栈为空的时候，要重置入栈元素（inFlag），如此重复这一过程即可
  function fn(s) {
    let res = 0
    const stack = []
    let inFlag = s[0]
    for (let i = 0; i < s.length; i++) {
      switch (s[i]) {
        case inFlag:
          stack.push(s[i])
          break
        default:
          stack.pop()
      }
      if (!stack.length) {
        inFlag = s[i+1]
        res++
      }

    }
    return res
  }

  console.log(fn(s));
}
// balancedStringSplit()

function revertStr() {
  const s = 'Test1ng-Leet=code-Q!'
  function fn(s) {
    const stack = []
    let res = ''
    for (let i = 0; i < s.length; i++) {
      if (/[a-zA-Z]/.test(s[i])) {
        stack.push(s[i])
        res += stack.pop()
      }
    }
    for (let j = 0; j < s.length; j++) {
      if (/[a-zA-Z]/.test(s[j])) {
        res += stack.pop()
      } else {
        res += s[j]
      }
    }
    return res
  }

  console.log(fn(s));
}
// revertStr()

/*
* 1684. 统计一致字符串的数目
给你一个由不同字符组成的字符串 allowed 和一个字符串数组 words 。如果一个字符串的每一个字符都在 allowed 中，就称这个字符串是 一致字符串 。

请你返回 words 数组中 一致字符串 的数目。

示例 1：

输入：allowed = "ab", words = ["ad","bd","aaab","baa","badab"]
输出：2
解释：字符串 "aaab" 和 "baa" 都是一致字符串，因为它们只包含字符 'a' 和 'b' 。
示例 2：

输入：allowed = "abc", words = ["a","b","c","ab","ac","bc","abc"]
输出：7
解释：所有字符串都是一致的。
示例 3：

输入：allowed = "cad", words = ["cc","acd","b","ba","bac","bad","ac","d"]
输出：4
解释：字符串 "cc"，"acd"，"ac" 和 "d" 是一致字符串。


提示：

1 <= words.length <= 104
1 <= allowed.length <= 26
1 <= words[i].length <= 10
allowed 中的字符 互不相同 。
words[i] 和 allowed 只包含小写英文字母。
*
* */

const countConsistentStrings = function(allowed, words) {

  return words.reduce((prev, curr) => {
    prev++
    for (let i = 0; i < curr.length; i++) {
      if (!allowed.includes(curr[i])) {
        prev--
        break
      }
    }
    return prev
  }, 0)
};

// console.log(countConsistentStrings("abc", ["a","b","c","ab","ac","bc","abc"]));

