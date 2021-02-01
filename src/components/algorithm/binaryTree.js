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

// console.log(sort());




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
// postOrderByStack2()
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

/*
* 题目描述：给你一个二叉树，请你返回其按 层序遍历 得到的节点值。 （即逐层地，从左到右访问所有节点）。
*
* 二叉树：[3,9,20,null,null,15,7],

  3
 / \
9  20
  /  \
 15   7
返回其层次遍历结果：

[
[3],
[9,20],
[15,7]
]

* */



function bfsToTree() {
  const root = {
    val: "3",
    left:  {
      val: "9",
    },
    right: {
      val: "20",
      left: {
        val: "15"
      },
      right: {
        val: "7"
      }
    }
  };
  function fn(root) {
    const queue = []
    const res = []

    queue.push(root)

    while (queue.length) {
      const level = []

      const len = queue.length

      for (let i = 0; i < len; i++) {
        const top = queue.pop()
        level.push(top.val)
        if (top.right) {
          queue.push(top.right)
        }
        if (top.left) {
          queue.push(top.left)
        }
      }
      res.push(level)
    }
    return res

  }

  console.log(fn(root));
}
// bfsToTree()

/*
* 题目描述：翻转一棵二叉树。

示例

输入：

     4
   /   \
  2     7
 / \   / \
1   3 6   9
输出：

     4
   /   \
  7     2
 / \   / \
9   6 3   1
* */

function invertTree() {
  const root = {
    val: "4",
    left:  {
      val: "2",
      left: {
        val: "1"
      },
      right: {
        val: "3"
      }

    },
    right: {
      val: "7",
      left: {
        val: "6"
      },
      right: {
        val: "9"
      }
    }
  };
  function fn(root) {
    if (!root) {
      return root
    }
    const left = fn(root.left)
    const right = fn(root.right)

    root.left = right
    root.right = left
    return root
  }

  console.log(fn(root));
}
// invertTree()

// 先序遍历
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
function preOrder2(root) {
  const queue = []
  const res = []

  queue.push(root)
  while (queue.length) {
    const top = queue.pop()
    res.push(top.val)
    if (top.right) {
      queue.push(top.right)
    }
    if (top.left) {
      queue.push(top.left)
    }
  }
  return res
}
function postOrder2(root) {
  const queue = []
  const res = []

  queue.push(root)

  while (queue.length) {
    const top = queue.shift()
    res.unshift(top.val)

    if (top.left) {
      queue.push(top.left)
    }
    if (top.right) {
      queue.push(top.right)
    }
  }
  return res
}
function inOrder(root) {
  const stack = []
  const res = []

  let cur = root
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
}
// console.log(inOrder(root2));

/*
* 108. 将有序数组转换为二叉搜索树
将一个按照升序排列的有序数组，转换为一棵高度平衡二叉搜索树。

本题中，一个高度平衡二叉树是指一个二叉树每个节点 的左右两个子树的高度差的绝对值不超过 1。

示例:

给定有序数组: [-10,-3,0,5,9],

一个可能的答案是：[0,-3,9,-10,null,5]，它可以表示下面这个高度平衡二叉搜索树：

      0
     / \
   -3   9
   /   /
 -10  5
* */
function TreeNode(val, left, right) {
  this.val = (val===undefined ? 0 : val)
  this.left = (left===undefined ? null : left)
  this.right = (right===undefined ? null : right)
}

const sortedArrayToBST = function(nums) {
  if (!nums.length) {
    return null
  }

  function buildBst(min, max) {
    if (min > max) {
      return null
    }

    const mid = Math.floor(min + (max - min) / 2)
    const cur = new TreeNode(nums[mid])
    cur.left = buildBst(min, mid - 1)
    cur.right = buildBst(mid + 1, max)

    return cur
  }

  const root = buildBst(0, nums.length - 1)

  return root
};
// console.log(sortedArrayToBST([-10, -3, 0, 5, 9]));

const bst =  {
  val: 5,
  left: {
    val: 3,
  },
  right: {
    val: 6,
    right: {
      val: 8
    }
  }
};

const search = (root, val) => {
  if (!root) {
    return null
  }
  if (val === root.val) {
    return root
  }
  if (val < root.val) {
    return search(root.left, val)
  }
  if (val > root.val) {
    return search(root.right, val)
  }
}
// console.log(search(bst, 6));

const insert = (root, val) => {
  if (!root) {
    return new TreeNode(val)
  }
  if (root.val > val) {
    root.left = insert(root.left, val)
  } else if (root.val < val) {
    root.right = insert(root.right, val)
  }
  return root
}

const deleteNode = (root, val) => {
  if (!root) {
    return null
  }
  if (root.val === val) {
    if (!root.left && !root.right) {
      root = null
    } else if (root.left) {
      const maxNode = findMax(root.left)
      root.val = maxNode.val
      root.left = deleteNode(root.left, root.val)
    } else {
      const minNode = findMin(root.right)
      root.val = minNode.val
      root.right = deleteNode(root.right, root.val)
    }
  } else if (val > root.val) {
    deleteNode(root.right)
  } else {
    deleteNode(root.left)
  }
  function findMax(node) {
    while (node.right) {
      node = node.right
    }
    return node
  }
  function findMin(node) {
    while (node.left) {
      node = node.left
    }
    return node
  }
}
