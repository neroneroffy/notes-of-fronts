

/*
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

function mergeList() {
  const listA = generateList([1, 2, 4])
  const listB = generateList([1, 3, 5])
  function func(headA, headB) {
    const head = new ListNode()
    let cur = head
    while (headA && headB) {
      if (headA.val <= headB.val) {
        cur.next = headA
        headA = headA.next
      } else {
        cur.next = headB
        headB = headB.next
      }
      cur = cur.next
    }
    cur.next = headA ? headA : headB
    return head.next
  }

  console.log(func(listA, listB).print());
}
// mergeList()

function deleteDuplicates() {
  function func(head) {
    const dummy = new ListNode()
    dummy.next = head
    let cur = dummy
    while (cur) {
      if (cur.next && cur.val === cur.next.val) {
        cur.next = cur.next.next
      }
      cur = cur.next
    }
    return dummy.next
  }
  const list = generateList([1, 1, 2, 3, 3, 4])
  console.log(func(list).print());
}
// deleteDuplicates()

function deleteAllDuplicates() {
  function func(head) {
    const dummy = new ListNode()
    dummy.next = head
    const map = new Map()
    let pre = dummy
    let cur = dummy.next
    while (cur) {
      if (cur.next && cur.val === cur.next.val) {
        let val = cur.val
        while (cur && cur.val === val) {
          pre.next = cur.next
          cur = cur.next
        }
      } else {
        pre = cur
        cur = cur.next
      }
    }
    return dummy.next
  }
  const list = generateList([1, 1, 2, 3, 3, 4, 4, 6, 6])
  console.log(func(list).print());
}
// deleteAllDuplicates()

function deleteNode() {
  const list = generateList([1, 4, 5, 9])
  function func(node) {
    node.val = node.next.val
    node.next = node.next.next
  }
  const node = list.switchNode(4)
  func(node)
  console.log(list.print());
}
// deleteNode()


*/
