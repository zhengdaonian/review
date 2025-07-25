### 为什么用web worker
Web Worker
允许在 js 主线程之外开辟新的 Worker 线程。利用 js 操作多线程的能力


在我们有大量运算任务时，可以把运算任务交给 Worker 线程去处理
当 Worker 线程计算完成，再把结果返回给 js 主线程
js 主线程只用专注处理业务逻辑，不用耗费过多时间去处理大量复杂计算
减少了阻塞时间，也提高了运行效率，页面流畅度和用户体验自然而然也提高了


Worker 在另一个全局上下文中运行，与当前的 window 不同！
Worker 线程是在浏览器环境中被唤起的
在 Worker 线程上下文中, window, parent, document 等属性都不可用


但是可以使用 self 来代替 window
可以使用 self.postMessage() 方法来向 js 主线程发送消息
可以使用 self.onmessage 来监听 js 主线程发送的消息


主线程与 worker 线程之间的数据传递是传值而不是传地址。所以你会发现，即使你传递的是一个Object，并且被直接传递回来，接收到的也不是原来的那个值了


监听错误信息
error           // 当worker内部出现错误时触发
messageerror    // 当 message 事件接收到无法被反序列化的参数时触发


关闭
myWorker.terminate()   // 主线程终止 worker 线程
self.close()           // worker 线程终止自身

无论谁关闭 worker，worker 线程当前的 Event Loop 中的任务会继续执行。但下一个 Event Loop 不会继续执行
主线程关闭，worker 线程会继续执行，但是主线程不会收到消息
worker 线程关闭，Event Loop 执行完之前  主线程还能收到消息



importScripts()  在 worker 线程中导入其他 js 文件


const myWorker = new Worker(aURL, options);

options

type: 'classic' | 'module'  // 表示 worker 线程的类型，默认为 classic
credentials: 'omit' | 'same-origin' | 'include' // 表示 worker 线程的凭证，默认为 omit
name: string  // 表示 worker 线程的名称，默认为空字符串





postMessage() 主线程和 worker 线程之间传递数据
可以是由结构化克隆算法处理的任何值或 JavaScript 对象，包括循环引用。
不能处理：

Error 以及 Function 对象；
DOM 节点
对象的某些特定参数不会被保留
RegExp 对象的 lastIndex 字段不会被保留
属性描述符，setters 以及 getters（以及其他类似元数据的功能）同样不会被复制。例如，如果一个对象用属性描述符标记为 read-only，它将会被复制为 read-write
原形链上的属性也不会被追踪以及复制。
