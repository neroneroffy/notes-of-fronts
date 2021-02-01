/*
* 给你一个整数数组 nums，请你选择数组的两个不同下标 i 和 j，使 (nums[i]-1)*(nums[j]-1) 取得最大值。

请你计算并返回该式的最大值。

示例 1：

输入：nums = [3,4,5,2]
输出：12
解释：如果选择下标 i=1 和 j=2（下标从 0 开始），则可以获得最大值，(nums[1]-1)*(nums[2]-1) = (4-1)*(5-1) = 3*4 = 12 。
示例 2：

输入：nums = [1,5,4,5]
输出：16
解释：选择下标 i=1 和 j=3（下标从 0 开始），则可以获得最大值 (5-1)*(5-1) = 16 。
示例 3：

输入：nums = [3,7]
输出：12
 

提示：

2 <= nums.length <= 500
1 <= nums[i] <= 10^3
* */

const maxProduct = function(nums) {
  let i = 0, j = 1
  let result = 0
  while (i < nums.length) {
    while (j < nums.length) {
      const currentRes = (nums[i] - 1) * (nums[j] - 1)
      if (currentRes > result) {
        result = currentRes
      }
      j++
    }
    i++
    j = i+1
  }
  return result
};

// console.log(maxProduct([3,7]));

/*
* 将每个元素替换为右侧最大元素
*
* 给你一个数组 arr ，请你将每个元素用它右边最大的元素替换，如果是最后一个元素，用 -1 替换。

完成所有替换操作后，请你返回这个数组。

示例：

输入：arr = [17,18,5,4,6,1]
输出：[18,6,6,6,1,-1]

提示：

1 <= arr.length <= 10^4
1 <= arr[i] <= 10^5

* */
const replaceElements = function(arr) {
  let i = 0, j = 1
  let currentMax = -1
  while (i < arr.length) {
    while (j < arr.length) {
      if (arr[j] > currentMax) {
        currentMax = arr[j]
      }
      j++
    }
    arr[i] = currentMax
    i++
    j = i + 1
    currentMax = -1
  }
  return arr
};
// console.log(replaceElements([17, 18, 5, 4, 6, 1]));

/*
* 在既定时间做作业的学生人数
* 给你两个整数数组 startTime（开始时间）和 endTime（结束时间），并指定一个整数 queryTime 作为查询时间。

已知，第 i 名学生在 startTime[i] 时开始写作业并于 endTime[i] 时完成作业。

请返回在查询时间 queryTime 时正在做作业的学生人数。形式上，返回能够使 queryTime 处于区间 [startTime[i], endTime[i]]（含）的学生人数。

示例 1：

输入：startTime = [1,2,3], endTime = [3,2,7], queryTime = 4
输出：1
解释：一共有 3 名学生。
第一名学生在时间 1 开始写作业，并于时间 3 完成作业，在时间 4 没有处于做作业的状态。
第二名学生在时间 2 开始写作业，并于时间 2 完成作业，在时间 4 没有处于做作业的状态。
第三名学生在时间 3 开始写作业，预计于时间 7 完成作业，这是是唯一一名在时间 4 时正在做作业的学生。
示例 2：

输入：startTime = [4], endTime = [4], queryTime = 4
输出：1
解释：在查询时间只有一名学生在做作业。
示例 3：

输入：startTime = [4], endTime = [4], queryTime = 5
输出：0
示例 4：

输入：startTime = [1,1,1,1], endTime = [1,3,2,4], queryTime = 7
输出：0
示例 5：

输入：startTime = [9,8,7,6,5,4,3,2,1], endTime = [10,10,10,10,10,10,10,10,10], queryTime = 5
输出：5
 
提示：

startTime.length == endTime.length
1 <= startTime.length <= 100
1 <= startTime[i] <= endTime[i] <= 1000
1 <= queryTime <= 1000

* */

const busyStudent = function(startTime, endTime, queryTime) {
  let i = 0;
  let result = 0
  while (i < startTime.length) {
    if (queryTime >= startTime[i] && queryTime <= endTime[i]) {
      result++
    }
    i++
  }
  return result
};
// console.log(busyStudent([9,8,7,6,5,4,3,2,1], [10,10,10,10,10,10,10,10,10], 5));

/*
*
* 349. 两个数组的交集
*
* 给定两个数组，编写一个函数来计算它们的交集。

 

示例 1：

输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2]
示例 2：

输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[9,4]

* */
const intersection = function(nums1, nums2) {
  const aSet = new Set(nums1)
  const bSet = new Set(nums2)

  const intersect = Array.from(new Set([...aSet].filter(z => bSet.has(z))))
  return intersect
};
const nums1 = [4,9,5]
const nums2 = [9,4,9,8,4]

console.log(intersection(nums1, nums2));
