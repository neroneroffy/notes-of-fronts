

// console.log('第一次循环主执行栈开始')

// setTimeout(function() {
//     console.log('第二次循环开始，宏任务队列的第一个宏任务执行中')
//     new Promise(function(resolve) {
//         console.log('第二次循环的宏任务队列的第一个宏任务的微任务继续执行')
//         resolve()
//     }).then(function() {
//         console.log('第二次循环的微任务队列的微任务执行')
//     })
// }, 0)

// new Promise(function(resolve) {
//     console.log('第一次循环主执行栈进行中...')
//     resolve()
// }).then(function() {
//     console.log('第一次循环微任务，第一次循环结束')
//     setTimeout(function() {
//         console.log('第二次循环的宏任务队列的第二个宏任务执行')
//     })
// })

// console.log('第一次循环主执行栈完成')

//   start
//   promise
//   end 
//   promise resolved 
//   timeout
//   promise in timeout
//   timeout in promise


const arr = [{fileName: "文档1",
nodeId: "1133275924701949952",
},
{
fileName: "文档2",
nodeId: "1133275743956807681",
}, {
fileName: "文档3",
nodeId: "1133275683449434112",
}, {
fileName: "文档4",
nodeId: "1133275743956807681",
}, {
fileName: "文档5",
nodeId: "1133275683449434112",
},
{
fileName: "文档6",
nodeId: "1133275924701949952",
}]


function getFileName(arr) {
    let newArr = arr.slice(0)
    for (let i = 0; i < arr.length; i++) {
        if (newArr.indexOf(item => arrp[i].nodeId === item.nodeId) >= 0) {
            item.fileList = [...item.fileList, item.fileName, arrp[i].fileName]
        }
    }

    return newArr
}
console.log(getFileName(arr))