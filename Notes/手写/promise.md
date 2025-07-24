### 手写 promise

重点是需要实现 Promise.then 方法
维护一个 fullfilled 的事件队列和一个 rejected 事件队列
在 Promise.then 方法里需要判断一下当前 Promise 的状态以及参数类型
最后需要实现两个事件队列的自执行，用来处理链式调用的情况
在执行方法时使用 setTimeout 模拟异步任务
