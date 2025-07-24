### 讲讲虚拟 DOM

### 虚拟 dom、dom diff

### diff 算法原理

● 虚拟 DOM 的好处：函数式编程模式、多端渲染

### vue2 和 vue3 和 react 得 diff 算法不同

### diff 算法基于啥算法实现的，原理

由于在浏览器中操作 DOM 是很昂贵的，频繁的操作 DOM，会产生一定的性能问题，这就是虚拟 DOM 的产生原因。虚拟 DOM 本质上是 JavaScript 对象，是对真实 DOM 的抽象状态变更时，记录新树与旧树的差异，最后把差异更新到真正的 DOM 中。
即使使用了 Virtual DOM 来进行真实 DOM 的渲染，在页面更新的时候，也不能全量地将整颗 Virtual DOM 进行渲染，而是去渲染改变的部分，这时候就需要一个计算 Virtual DOM 树改变部分的算法了，这个算法就是 Diff 算法。
diff 算法的作用：用来修改 DOM 的一小段，不会引起 dom 树的重绘
