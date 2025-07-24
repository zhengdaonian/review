### promise 的优缺点和理解

### 实现 Promise.all 和 Promise.race

```
all是全部执行完成才返回值
var p1 = fn('第一次')
var p2 = fn('第二次')
var p3 = fn('第三次')

Promise.all([p1, p2, p3]).then((res) => {
    console.log(res);
})
//  打印   ['第一次','第二次','第三次']
```

```
race是一个任务完成就能获取
var p1 = fn('第一次')
var p2 = fn('第二次')
var p3 = fn('第三次')

Promise.race([p1, p2, p3]).then((res) => {
    console.log(res);
})
```

## promise(A).catch(f1).then(f2),f1 执行后 f2 回执行吗，为什么


### Promise的静态方法和实例方法

async/await 和 Promise 什么区别？
async/await 怎么实现的？

怎么理解 JS 的异步？

异步的一些 API，比如 setTimeout，setInterval，requestIdleCallback 和 requestAnimationFrame 还有 Promise，这几个有什么区别？