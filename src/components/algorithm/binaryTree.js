const root1 = {
  val: "A",
  left: {
    val: "B",
    left: {
      val: "D"
    },
    right: {
      val: "E"
    }
  },
  right: {
    val: "C",
    right: {
      val: "F"
    }
  }
};

// 先序遍历
const preOrder = node => {
  if (!node) {
    return
  }
  console.log(node.val)
  preOrder(node.left)
  preOrder(node.right)
}
// console.log(preOrder(root));

// 层序遍历
const BFS = node => {
  let queue = []
  queue.push(node)

  while (queue.length) {
    const current = queue[0]
    console.log(current.val);
    if (current.left) {
      queue.push(current.left)
    }
    if (current.right) {
      queue.push(current.right)
    }
    queue.shift()
  }
}
// BFS(root)

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

// console.log(sort());

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
* 题目描述：给定一个二叉树，返回它的前序（先序）遍历序列。
*
* 示例: 输入: [1,null,2,3]

1
 \
  2
 /
3
输出: [1,2,3]
进阶: 递归算法很简单，你可以通过迭代算法完成吗？
* */

function preOrderByStack() {
  const root = {
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

  function fn(root) {
    const stack = []
    const res = []
    stack.push(root)
    while (stack.length) {
      const top = stack.pop()
      res.push(top.val)
      if (top.right) {
        stack.push(top.right)
      }
      if (top.left) {
        stack.push(top.left)
      }
    }
    return res
  }
  console.log(fn(root));
}
// preOrderByStack()
function postOrderByStack() {
  const root = {
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

  function fn(root) {
    const res = []
    const stack = []
    stack.push(root)
    while (stack.length) {
      const cur = stack.pop()
      res.unshift(cur.val)
      if (cur.right) {
        stack.push(cur.right)
      }
      if (cur.left) {
        stack.push(cur.left)
      }
    }
    return res
  }
  console.log(fn(root));
}
// postOrderByStack()

function postOrderByStack2() {
  const root = {
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
  function fn(root) {
    const stack = []
    const res = []
    stack.push(root)
    while (stack.length) {
      const top = stack.pop()
      res.unshift(top)
      if (top.right) {
        stack.push(top.right)
      }
      if (top.left) {
        stack.push(top.left)
      }
    }
    return res
  }
  console.log(fn(root));
}
postOrderByStack2()
function inOrderByStack() {
  const root = {
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
  function fn(node) {
    const stack = []
    const res = []
    stack.push(node)
    while (stack.length) {
      if (node.left) {
        stack.push(node.left)
      }
      res.push(stack.pop())
      if (node.right) {
        stack.push(node.right)
      }
    }
  }

  console.log(fn(root));
}
// inOrderByStack()
