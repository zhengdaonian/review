## Vue 响应式原理

### Object.defineProperty 响应式实现的原理

1. 调用 observer 方法，使用 defineProperty 依次对 data 中的属性监听
2. defineProperty 无法监听数组，所以数组是通过重写原生方法实现
3. 对象的监听主要是通过遍历对象属性，如果存在嵌套对象，还需要再 defineReactive 中递归

### Object.defineProperty 缺点

1. 复杂对象进行深度监听，计算量大

### vue 组件传值方式，兄弟组件的传值

### Proxy 和 Object.defineProperty 的区别

### vue2 对比 vue3 做了哪些改进？

### 为什么 Vue3 用 proxy 改写数据劫持

### props 数据流向

### 为什么 data 树形是一个函数不是一个对象

### vue 为什么要加 key

### Vue2 中数组哪些方法会触发 Vue 监听,哪些不会触发监听

当我们直接通过索引赋值给数组元素时，Vue 的数组会丢失响应式，比如 arr[0] = newValue 不会触发视图更新 还有像 sort()和 reverse()这些方法。
为了不丢失响应式可以使用:push、pop、shift、unshift、splice 这些方法来操作数组

### vue template 中 {{}} 为什么能够被执行

### 数据响应(数据劫持)

### 数据响应的实现由两部分构成: 观察者( watcher ) 和 依赖收集器( Dep )，其核心是 defineProperty 这个方法，它重写属性的 get 与 set 方法，从而完成监听数据的改变。一般会要求从解析到收集依赖到通知一套工作原理比较熟悉。我是大概理解，跟着读了一些源码，但是还是没有讲很清楚，遗憾没有表现好。

● Vue3 的优化点有哪些
● Vue3 移除了 .native 事件修饰符，我们怎么去写原生事件？
● Vue 中 CSS scoped 的原理
Vue 项目中的 Model 层设计
Vue 模板是如何编译的

写一个 Vue 输入框组件，有防抖功能，并处理父子组件传参


Vue2 和 Vue3 的 diff 用了什么算法库？
Vue 的插件机制，底层原理是什么
