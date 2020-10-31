// 数组，找到目标差值
function findTarget() {
  const nums = [2, 7, 11, 15]
  function func(nums, target) {
    const map = {}
    for (let i = 0; i < nums.length; i++) {
      if (map[target - nums[i]] !== undefined) {
        return [ map[target - nums[i]], i ]
      }
      map[nums[i]] = i
    }
  }
  console.log(func(nums, 18))
}
// findTarget()
function composeArray() {
  /*
  真题描述：给你两个有序整数数组 nums1 和 nums2，请你将 nums2 合并到 nums1 中，
  使 nums1 成为一个有序数组。说明: 初始化 nums1 和 nums2 的元素数量分别为 m 和 n 。
   你可以假设 nums1 有足够的空间（空间大小大于或等于 m + n）来保存 nums2 中的元素。
  * 示例: 输入:
  * nums1 = [1,2,3,0,0,0], m = 3
  * nums2 = [2,5,6], n = 3
  * 输出: [1,2,2,3,5,6]
  * */
  // 双指针法
  const nums1 = [1,2,3,0,0,0], m = 3
  const nums2 = [2,5,6], n = 3
  function func(nums1, nums2, m, n) {
    let i = m - 1, j = n - 1, k = m + n - 1
    while (i >= 0 && j >= 0) {
      if (nums1[i] >= nums2[j]) {
        nums1[k] = nums1[i]
        i--
        k--
      } else {
        nums1[k] = nums2[j]
        j--
        k--
      }
    }
    while (j >= 0) {
      nums1[k] = nums2[j]
      j--
      k--
    }
    return nums1
  }

  console.log(func(nums1, nums2, m, n));
}
// composeArray()

function threeSums() {
  /*
  * 真题描述：给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，
  * 使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。注意：答案中不可以包含重
  * 复的三元组。
  *
  * 示例： 给定数组 nums = [-1, 0, 1, 2, -1, -4]， 满足要求的三元组集合为： [ [-1, 0, 1], [-1, -1, 2] ]
  * */
  const nums = [-1, 0, 1, 2, -1, -4]
  function func(nums) {
    nums = nums.sort((a, b) => a - b)
    const result = []
    let len = nums.length
    for (let i = 0; i < len - 2; i++) {
      const fix = nums[i]
      let j = i + 1
      let k = len - 1
      if (i > 0 && nums[1] === nums[i - 1]) {
        continue
      }
      while ( j < k) {
        if (fix + nums[j] + nums[k] < 0) {
          j++
          while(j < k && nums[j] === nums[j - 1]) {
            j++
          }
        } else if (fix + nums[j] + nums[k] > 0) {
          k--
          while(j < k && nums[k] === nums[k + 1]) {
            k--
          }
        } else {
          result.push([ fix, nums[j], nums[k] ])
          j++
          k--
          while(j < k && nums[j] === nums[j - 1]) {
            j++
          }
          while(j < k && nums[k] === nums[k + 1]) {
            k--
          }
        }
      }
    }
    return result
  }

  console.log(func(nums));
}
// threeSums()

function deleteString() {
  /*
  * 真题描述：给定一个非空字符串 s，最多删除一个字符。判断是否能成为回文字符串。
    示例 1: 输入: "aba"
    输出: True
    示例 2:
    输入: "abca"
    输出: True
    解释: 你可以删除c字符。
    注意: 字符串只包含从 a-z 的小写字母。字符串的最大长度是50000。
  * */

  function isPlalindrome(str) {
    const result = str.split('').reverse().join('')
    return str === result
  }
  function func(str) {
    let _str = str
    for (let i = 0; i < str.length; i++) {
      const arr = _str.split('')
      arr.splice(i, 1)
      const strConvert = arr.join('')
      console.log(strConvert);
      if (isPlalindrome(strConvert)) {
        return true
      }
      _str = str
    }
  }
  function func2(str) {
    function isPlalindrome(st, ed) {
      while (st < ed) {
        if (str[st] !== str[ed]) {
          return false
        }
        st++
        ed--
      }
      return true
    }
    let i = 0, j = str.length - 1

    while (i < j && str[i] === str[j]) {
      i++
      j--
    }
    if (isPlalindrome(i + 1, j)) {
      return true
    }
    if (isPlalindrome(i, j - 1)) {
      return false
    }
    return false
  }
  console.log(func2("abca"));
}
// deleteString()

function ListNode(val, next) {
  this.val = (val===undefined ? 0 : val)
  this.next = (next===undefined ? null : next)
  this.print = function () {
    const arr = []
    let curr = this
    while (curr !== null) {
      arr.push(curr.val)
      curr = curr.next
    }
    return arr.join(',')
  }
  this.switchNode = function (val) {
    let cur = this
    while (cur.val !== val) {
      cur = cur.next
    }
    return cur
  }
}
function generateList(arr) {
  let l = new ListNode(arr[0])
  let curr = l
  for (let i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i])
    curr = curr.next
  }
  return l
}
/*
* 合并两个有序链表
* 将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。
*
* 示例：
  输入：1->2->4, 1->3->4
  输出：1->1->2->3->4->4
* */
function mergeLists() {
  const mergeTwoLists = function(l1, l2) {
    let head = new ListNode()
    let cur = head
    while (l1 && l2) {
      if (l1.val <= l2.val) {
        cur.next = l1
        l1 = l1.next
      } else {
        cur.next = l2
        l2 = l2.next
      }
      cur = cur.next
    }
    cur.next = l1 !== null ? l1 : l2
    return head.next
  };
}

/*

真题描述：给定一个排序链表，删除所有重复的元素，使得每个元素只出现一次。
* 示例 1:
  输入: 1->1->2
  输出: 1->2
  示例 2:
  输入: 1->1->2->3->3
  输出: 1->2->3
* */
const deleteDuplicates = function(head) {
  let cur = head
  while (cur !== null && cur.next !== null) {
    if (cur.val === cur.next.val) {
      cur.next = cur.next.next
    } else {
      cur = cur.next
    }
  }
  return head
};

/*
* 真题描述：给定一个排序链表，删除所有含有重复数字的结点，只保留原始链表中 没有重复出现的数字。
* 示例 1:
  输入: 1->2->3->3->4->4->5
  输出: 1->2->5
  示例 2:
  输入: 1->1->1->2->3
  输出: 2->3
* */

var removeDuplicateNodes = function(head) {
  const map = new Map()
  const dummy = new ListNode()
  dummy.next = head
  let pre = dummy
  let cur = dummy.next
  // 只有在不重复的情况下，才移动前序结点
  while (cur) {
    if (!map.get(cur.val)) {
      map.set(cur.val, cur)
      pre = cur
      cur = cur.next
    } else {
      // 重复则将前序节点的next指向当前节点的下一个，
      // 跳过前序节点对于重复节点的指向

      // 当前是重复节点，后移一个检查下一个节点
      pre.next = cur.next
      cur = cur.next
    }
  }
  return dummy.next
};
// console.log(removeDuplicateNodes(generateList([1, 2, 3, 3, 2, 1])).print())

/*
  删除指定链表结点

  请编写一个函数，使其可以删除某个链表中给定的（非末尾）节点。传入函数的唯一参数为 要被删除的节点 。
  输入：head = [4,5,1,9], node = 5
  输出：[4,1,9]
  解释：给定你链表中值为 5 的第二个节点，那么在调用了你的函数之后，该链表应变为 4 -> 1 -> 9.
* */
function deleteNode() {
  function func(node) {
    node.val = node.next.val
    node.next = node.next.next
  }
  const head = generateList([4,5,1,9])
  const node = head.switchNode(4)
  func(node)
  console.log(head.print());
}
// deleteNode()

function removeAllDuplicates() {
  const arr = [ 1, 1, 1, 2, 3, 4, 5 ]

  const list = generateList(arr)
  const deleteDuplicates2 = function(head) {
    // const dummy = new ListNode()
    // dummy.next = head
    // let curr = dummy
    // while (curr.next !== null && curr.next.next !== null) {
    //   if (curr.next.val === curr.next.next.val) {
    //     let val = curr.next.val
    //     while (curr.next && curr.next.val === val) {
    //       curr.next = curr.next.next
    //     }
    //   } else {
    //     curr = curr.next
    //   }
    // }
    // return dummy.next

    let dummy = new ListNode()
    dummy.next = head
    let curr = dummy

    while(curr.next !== null && curr.next.next !== null) {
      if (curr.next.val === curr.next.next.val) {
        let val = curr.next.val
        while (curr.next && curr.next.val === val) {
          curr.next = curr.next.next
        }
      } else {
        curr = curr.next
      }
    }
    return dummy.next
  };
// console.log(deleteDuplicates2(list).print());
}
/*
* 真题描述：给定一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。
*
* 示例： 给定一个链表: 1->2->3->4->5, 和 n = 2.
* 当删除了倒数第二个结点后，链表变为 1->2->3->5.
* 说明： 给定的 n 保证是有效的。
* */
function removeItemFromEnd() {
  const list = generateList([1, 2, 3, 4, 5])
  function func(head, n) {
    // 增加头部节点
    const dummy = new ListNode()
    dummy.next = head
/*
    let k = 0
    let curr = dummy
    // 准备删除的节点
    let deletePrev = dummy
    let deleteNext = null
    while (curr !== null) {
      if (k >= n + 1) {
        deletePrev = deletePrev.next
        deleteNext = deletePrev.next.next
      }
      k++
      curr = curr.next
    }
    if (deleteNext !== null) {
      deletePrev.next = deleteNext
    } else {
      deletePrev.next = head.next
    }
*/
    let fast = dummy
    let slow = dummy
    while (n !== 0) {
      fast = fast.next
      n--
    }
    while (fast.next !== null) {
      fast = fast.next
      slow = slow.next
    }
    slow.next = slow.next.next
    return dummy.next
  }
  console.log(func(list, 3).print());
}
// removeItemFromEnd()
/*
  实现一种算法，找出单向链表中倒数第 k 个节点。返回该节点的值。
  输入： 1->2->3->4->5 和 k = 2
  输出： 4
* */
function findNodeFormEnd() {
  const list = generateList([1, 2, 3, 4, 5])
  function func(head, k) {
    let fast = head
    let slow = head
    while (k !== 0) {
      fast = fast.next
      k--
    }

    while (fast !== null) {
      fast = fast.next
      slow = slow.next
    }
    return slow.val
  }

  console.log(func(list, 5));
}
// findNodeFormEnd()

/*
* 输入一个链表，输出该链表中倒数第k个节点。为了符合大多数人的习惯，本题从1开始计数，即链表的尾节点是倒数第1个节点。
* 例如，一个链表有6个节点，从头节点开始，它们的值依次是1、2、3、4、5、6。这个链表的倒数第3个节点是值为4的节点。
* 示例：
  给定一个链表: 1->2->3->4->5, 和 k = 2.
  返回链表 4->5.
* */
function getKthFromEnd() {
  const list = generateList([1, 2, 3, 4, 5])
  function func(head, k) {
    const dummy = new ListNode()
    dummy.next = head
    const newList = new ListNode()
    let fast = dummy
    let slow = dummy
    while (k !== 0) {
      fast = fast.next
      k--
    }
    while (fast !== null) {
      fast = fast.next
      slow = slow.next
    }
    newList.next = slow
    return newList.next
  }
  console.log(func(list, 3).print());
}

// getKthFromEnd()
// 多指针 链表的反转
/*
* 真题描述：定义 一个函数，输入一个链表的头结点，反转该链表并输出反转后链表的头结点。
* 示例:
* 输入: 1->2->3->4->5->NULL
* 输出: 5->4->3->2->1->NULL
* */
function reverseLinkList() {
  const arr = [ 1, 2, 3, 4, 5 ]
  const linkedList = generateList(arr)
  function func(head) {
    let prev = null
    let curr = head
    while (curr !== null) {
      let next = curr.next
      curr.next = prev
      prev = curr
      curr = next
    }
    return prev
  }
  function func2(head) {

    function recursion(head) {
      if (!head || !head.next) {
        return head
      }
      let next = head.next
      let reverseHead = recursion(next)
      head.next = null
      next.next = head
      return reverseHead
    }
    return recursion(head)
  }
  console.log(func2(linkedList).print());
}
// reverseLinkList()
function f(head) {
  let cur = head
  let prev = null
  while (cur) {
    let next = cur.next
    cur.next = prev
    prev = cur
    cur = next
  }
  return cur
}
/*
* 局部反转链表
* 真题描述：反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

  说明: 1 ≤ m ≤ n ≤ 链表长度。

  示例:
  输入: 1->2->3->4->5->NULL, m = 2, n = 4
  输出: 1->4->3->2->5->NULL
* */
function reverseLinkListPartial() {
  const arr = [ 1, 2, 3, 4, 5 ]
  const linkedList = generateList(arr)
  function func(head, m, n) {
    let pre, leftHead, cur
    const dummy = new ListNode()
    dummy.next = head
    let p = dummy

    for (let i = 0; i < m - 1; i++) {
      p = p.next
    }

    leftHead = p

    let start = leftHead.next
    pre = start
    cur = pre.next
    for (let i = m; i < n; i++) {
      let next = cur.next
      cur.next = pre
      pre = cur
      cur = next
    }
    leftHead.next = pre
    start.next = cur
    return head
  }
  function func2(head, m, n) {
    // 要依赖前序节点，所以要手动创建一个前序节点
    const dummy = new ListNode()
    dummy.next = head
    // p作为游标要移动到整个区间起点的前序节点
    let p = dummy
    for (let i = 0; i < m - 1; i++) {
      p = p.next
    }
    let leftHead = p
    // 存储起点
    let start = leftHead.next

    // pre作为真正反转区间的前序节点
    let pre = start
    let cur = pre.next

    for (let i = m; i < n; i++) {
      let next = cur.next
      cur.next = pre
      pre = cur
      cur = next
    }

    // 区间的起点的前序节点
    leftHead.next = pre
    start.next = cur

    return head
  }
  console.log(func2(linkedList, 2, 4).print());
}
// reverseLinkListPartial()

/*
* 从尾到头打印链表
* 输入一个链表的头节点，从尾到头反过来返回每个节点的值（用数组返回）
* 示例
  输入：head = [1,3,2]
  输出：[2,3,1]

  限制：
  0 <= 链表长度 <= 10000
* */
function reversePrint() {
  const list = generateList([1,3,2])
  function func(head) {
    const result = []
    let cur = head
    while (cur !== null) {
      result.push(cur.val)
      cur = cur.next
    }
    return result.reverse()
  }

  console.log(func(list));
}
// reversePrint()

/*
* 删除链表中等于给定值 val 的所有节点。
*
* 示例:

  输入: 1->2->6->3->4->5->6, val = 6
  输出: 1->2->3->4->5
* */
function deleteAllNodeEqualsVal() {
  const list = generateList([ 1, 2, 6, 6, 3, 4, 5, 6 ])
  function func(head, val) {
    const dummy = new ListNode()
    dummy.next = head
    let pre = dummy
    let cur = head
    while (cur !== null) {
      if (cur.val === val) {
        pre.next = cur.next
        cur = cur.next
      } else {
        pre = cur
        cur = cur.next
      }
    }
    return dummy.next
  }
  function recursion(head) {
    return function (val) {
      function func(node) {

      }
    }
  }
  console.log(func(list, 6).print());
}
// deleteAllNodeEqualsVal()

/*
* 链表的中间结点
*
* 给定一个带有头结点 head 的非空单链表，返回链表的中间结点。
  如果有两个中间结点，则返回第二个中间结点。

  示例 1：

  输入：[1,2,3,4,5]
  输出：此列表中的结点 3 (序列化形式：[3,4,5])
  返回的结点值为 3 。 (测评系统对该结点序列化表述是 [3,4,5])。
  注意，我们返回了一个 ListNode 类型的对象 ans，这样：
  ans.val = 3, ans.next.val = 4, ans.next.next.val = 5, 以及 ans.next.next.next = NULL.
  示例 2：

  输入：[1,2,3,4,5,6]
  输出：此列表中的结点 4 (序列化形式：[4,5,6])
  由于该列表有两个中间结点，值分别为 3 和 4，我们返回第二个结点。
   
  提示：

  给定链表的结点数介于 1 和 100 之间。
* */

function middleNode() {
  const list = generateList([ 1,2,3,4,5,6 ])
  function func(head) {
/*
    const stack = []
    let cur = head
    while (cur !== null) {
      stack.push(cur)
      cur = cur.next
    }
    let endPoint = Math.ceil(stack.length / 2)
    if (stack.length % 2 === 0) {
      endPoint = endPoint + 1
    }
    return stack[endPoint - 1]
*/
// 快慢指针
    // 快指针走两步，慢指针走一步，当快指针走到末尾时，慢指针正好在中间
    let fast = head
    let slow = head
    let count = 0
    while (fast !== null && fast.next !== null) {
      fast = fast.next.next
      slow = slow.next
      count++
    }
    return slow
  }
  console.log(func(list).print())
}
// middleNode()

/*
* 链表相交
*
* 给定两个（单向）链表，判定它们是否相交并返回交点。请注意相交的定义基于节点的引用，
* 而不是基于节点的值。换句话说，如果一个链表的第k个节点与另一个链表的第j个节点是同一
* 节点（引用完全相同），则这两个链表相交。
*
* 示例 1：

  输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,0,1,8,4,5], skipA = 2, skipB = 3
  输出：Reference of the node with value = 8
  输入解释：相交节点的值为 8 （注意，如果两个列表相交则不能为 0）。从各自的表头开始算起，链表 A 为 [4,1,8,4,5]，
  链表 B 为 [5,0,1,8,4,5]。在 A 中，相交节点前有 2 个节点；在 B 中，相交节点前有 3 个节点。

  示例 2：

  输入：intersectVal = 2, listA = [0,9,1,2,4], listB = [3,2,4], skipA = 3, skipB = 1
  输出：Reference of the node with value = 2
  输入解释：相交节点的值为 2 （注意，如果两个列表相交则不能为 0）。从各自的表头开始算起，链表 A 为 [0,9,1,2,4]，
  链表 B 为 [3,2,4]。在 A 中，相交节点前有 3 个节点；在 B 中，相交节点前有 1 个节点。

  示例 3：

  输入：intersectVal = 0, listA = [2,6,4], listB = [1,5], skipA = 3, skipB = 2
  输出：null
  输入解释：从各自的表头开始算起，链表 A 为 [2,6,4]，链表 B 为 [1,5]。由于这两个链表不相交，所以 intersectVal
  必须为 0，而 skipA 和 skipB 可以是任意值。
  解释：这两个链表不相交，因此返回 null。

  注意：

  如果两个链表没有交点，返回 null 。
  在返回结果后，两个链表仍须保持原有的结构。
  可假定整个链表结构中没有循环。
  程序尽量满足 O(n) 时间复杂度，且仅用 O(1) 内存。
* */
function getIntersectionNode() {
  const a1 = new ListNode(4)
  const a2 = new ListNode(1)
  const a3 = new ListNode(8)
  const a4 = new ListNode(4)
  const a5 = new ListNode(5)

  const b1 = new ListNode(5)
  const b2 = new ListNode(0)
  const b3 = new ListNode(1)
  const b4 = a3
  const b5 = new ListNode(4)
  const b6 = new ListNode(5)
  a1.next = a2
  a2.next = a3
  a3.next = a4
  a4.next = a5

  b1.next = b2
  b2.next = b3
  b3.next = b4
  b4.next = b5
  b5.next = b6

  function func(headA, headB) {
    let curA = headA
    let curB = headB
    const map = new Map()
    while (curA !== null) {
      if (map.get(curA)) {
        return curA
      }
      map.set(curA, true)
      curA = curA.next

    }
    while (curB !== null) {
      if (map.get(curB)) {
        return curB
      }
      map.set(curB, true)
      curB = curB.next
    }
    return null
  }

  console.log(func(a1, b1).print());
}
// getIntersectionNode()

/*
* 环形链表
*
* 给定一个链表，判断链表中是否有环。
  为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。
  如果 pos 是 -1，则在该链表中没有环。
* */

function hasCycle() {
  const list = generateList([1, 2, 3, 4])
  const node3 = list.switchNode(3)
  const node4 = list.switchNode(4)

  node4.next = node3
  function func(head) {
/*
    while (head) {
      if (head.flag) {
        return true
      } else {
        head.flag = true
        head = head.next
      }
    }
    return false
*/
    // 快慢指针法
    let fast = head.next.next
    let slow = head

    while (slow) {
      if (slow === fast) {
        return true
      }
      slow = slow.next
      if (fast) {
        fast = fast.next.next
      }
    }
    return false
  }
  console.log(func(list));
}
// hasCycle()
/*
* 二进制链表转整数
* 给你一个单链表的引用结点 head。链表中每个结点的值不是 0 就是 1。已知此链表是一个整数数字的二进制表示形式。

  请你返回该链表所表示数字的 十进制值 。

  输入：head = [1,0,1]
  输出：5
  解释：二进制数 (101) 转化为十进制数 (5)
* */

function getDecimalValue() {
  const list = generateList([1, 0, 1])
  function func(head) {
    // flag法
    let str = []
    while (head) {
      str.push(head.val)
      head = head.next
    }
    return parseInt(str.join(''), 2)
  }
  console.log(func(list))
}
// getDecimalValue()

function sortOrder(a1, a2) {
  let res = []
  for (let i = 0; i < a1.length; i++) {
    if (a2[i] && a1[i] >= a2[i]) {
      res.unshift(a1[i])
    } else {
      if (a2[i]) {
        res.unshift(a2[i])
      } else {
        res.unshift(a1[i])
      }
    }
  }
  res = a2.length ? res.concat(a2) : res

  return res
}

console.log(sortOrder([1, 2, 2, 3], [5, 12]));
