## Vue 响应式原理

### Object.defineProperty 响应式实现的原理

1. 调用 observer 方法，使用 defineProperty 依次对 data 中的属性监听
2. defineProperty无法监听数组，所以数组是通过重写原生方法实现
3. 对象的监听主要是通过遍历对象属性，如果存在嵌套对象，还需要再defineReactive中递归

### Object.defineProperty 缺点

1. 复杂对象进行深度监听，计算量大


### vue2和vue3和react得diff算法不同


### diff 算法基于啥算法实现的，原理
由于在浏览器中操作DOM是很昂贵的，频繁的操作DOM，会产生一定的性能问题，这就是虚拟DOM的产生原因。虚拟DOM本质上是JavaScript对象，是对真实DOM的抽象状态变更时，记录新树与旧树的差异，最后把差异更新到真正的DOM中。
即使使用了Virtual DOM来进行真实DOM的渲染，在页面更新的时候，也不能全量地将整颗Virtual DOM进行渲染，而是去渲染改变的部分，这时候就需要一个计算Virtual DOM树改变部分的算法了，这个算法就是Diff算法。
diff算法的作用：用来修改DOM的一小段，不会引起dom树的重绘


### vue 组件传值方式，兄弟组件的传值