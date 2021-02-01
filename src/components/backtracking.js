/*
* 题目描述：给定一个没有重复数字的序列，返回其所有可能的全排列。
* 示例：
输入: [1,2,3]
输出: [
[1,2,3],
[1,3,2],
[2,1,3],
[2,3,1],
[3,1,2],
[3,2,1]
]
* */
function sort() {
  const arr = [1, 2, 3]
  function fn(nums) {
    const len = arr.length
    const visited = {}
    const cur = []
    const res = []

    function allPermutations(nth) {
      if (nth === len) {
        res.push(cur.slice())
        return
      }
      for (let i = 0; i < len; i++) {
        if (!visited[nums[i]]) {
          visited[nums[i]] = 1
          cur.push(nums[i])
          allPermutations(nth + 1)
          cur.pop()
          visited[nums[i]] = 0
        }
      }
    }
    allPermutations(0)
    return res
  }
  return fn(arr)
}


/*
* 题目描述：给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。
说明：解集不能包含重复的子集。

示例: 输入: nums = [1,2,3]
输出:
[
[3],
[1],
[2],
[1,2,3],
[1,3],
[2,3],
[1,2],
[]
]
* */
function subset() {
  const arr = [1, 2, 3]
  function fn(nums) {
    let len = nums.length
    let res = []
    let cur = []
    dfs(0)
    function dfs(index) {
      res.push(cur.slice())
      for (let i = index; i < len; i++) {
        cur.push(nums[i])
        dfs(i+1)
        cur.pop()
      }
    }
    return res
  }

  console.log(fn(arr));
}
// subset()

/*
* 无重复字符串的排列组合
*
* 无重复字符串的排列组合。编写一种方法，
* 计算某字符串的所有排列组合，字符串每个字符均不相同。
*
* 输入：S = "qwe"
  输出：["qwe", "qew", "wqe", "weq", "ewq", "eqw"]
*
* */
const permutation = function(S) {
  const res = []
  let cur = ''
  const len = S.length
  const visited = {}
  function dfs(nth) {
    if (nth === len) {
      res.push(cur)
      return
    }

    for (let i = 0; i < len; i++) {
      if (!visited[S[i]]) {
        visited[S[i]] = 1
        cur += S[i]
        dfs(nth + 1)
        delete visited[S[i]]
        cur = cur.substr(0, cur.length - 1)
      }
    }
  }
  dfs(0)
  return res
};
// console.log(permutation('qwe'));


/*
* 括号。设计一种算法，打印n对括号的所有合法的（例如，开闭一一对应）组合。

说明：解集不能包含重复的子集。

例如，给出 n = 3，生成结果为：

[
  "((()))",
  "(()())",
  "(())()",
  "()(())",
  "()()()"
]
* */
const generateParenthesis = function(n) {
  const res = []
  const dfs = (left, right, s) => {
    if (left === 0 && right === 0) {
      res.push(s)
      s = ''
      return
    }
    if (left > 0) {
      dfs(left - 1, right, s + '(')
    }
    if (right > left) {
      dfs(left, right - 1, s + ')')
    }
    return res
  }
  dfs(n, n, '')
  return res
};
console.log(generateParenthesis(3));
