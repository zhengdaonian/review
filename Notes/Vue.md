## Vue 响应式原理

### Object.defineProperty 响应式实现的原理

1. 调用 observer 方法，使用 defineProperty 依次对 data 中的属性监听
2. defineProperty无法监听数组，所以数组是通过重写原生方法实现
3. 对象的监听主要是通过遍历对象属性，如果存在嵌套对象，还需要再defineReactive中递归

### Object.defineProperty 缺点

1. 复杂对象进行深度监听，计算量大