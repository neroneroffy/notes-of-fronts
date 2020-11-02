/*
* Async Await就是自执行的generator函数
* */

function asyncFunc(func) {
    const gen = func()
    function next(data) {
        const result = gen(data)
        if (result.done) {
            return result.value
        }
        result.value.then(() => {
            next(data)
        })
    }
    next()
}
function asyncToGenerator(generatorFunc) {
    return function() {
        const gen = generatorFunc.apply(this, arguments)
        return new Promise((resolve, reject) => {
            function step(key, arg) {
                let generatorResult
                try {
                    generatorResult = gen[key](arg)
                } catch (error) {
                    return reject(error)
                }
                const { value, done } = generatorResult
                if (done) {
                    return resolve(value)
                } else {
                    return Promise.resolve(value).then(val => step('next', val), err => step('throw', err))
                }
            }
            step("next")
        })
    }
}

function asyncFunction(func) {
    return function () {
        return new Promise((resolve, reject) =>{
            const gen = func.apply(this, arguments)
            function step(key, arg) {
                let genResult
                try {
                    genResult = gen[key](arg)
                } catch (err) {
                    return reject(err)
                }
                if (genResult.done) {
                    return resolve(genResult.value)
                } else {
                    return Promise.resolve(genResult.value).then(val => step('next', val), err => step('throw', err))
                }
            }
            step('next')
        })
    }
}
var calPoints = function(ops) {
    const res = []
    let result = 0
    let curr
    for (let i = 0; i < ops.length; i++) {
         switch (ops[i]) {
            case 'C':
                result -= res[res.length - 1]
                res.pop()
                break;
            case 'D':
                curr = res[res.length - 1] * 2
                res.push(curr)
                result += curr
                break
            case '+':
                curr = (res[res.length  - 1] + res[res.length - 2])
                res.push(curr)
                result += curr
                break
            default:
                curr = ops[i] * 1
                res.push(curr)
                result += curr
        }
    }
    return result
};
console.log(calPoints(["5","-2","4","C","D","9","+","+"]));

var minOperations = function(logs) {
    let res = 0
    for (let i = 0; i < logs.length; i++) {
        switch(logs[i]) {
            case './':
                res += 0
                break
            case '../':
                if (res > 0) {
                    res -= 1
                }
                break
            default:
                res+=1
        }
    }
    return res
};