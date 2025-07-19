## Vue和React对比

### 相同点
- 都有组件化思想
- 都支持服务器端渲染
- 都有Virtual DOM（虚拟dom）
- 数据驱动视图
- 都有支持native的方案：Vue的weex、React的React native
- 都有自己的构建工具：Vue的vue-cli、React的Create React App

### 区别
- 数据流向的不同。react从诞生开始就推崇单向数据流，而Vue是双向数据流
- 数据变化的实现原理不同。react使用的是不可变数据，而Vue使用的是可变的数据
- 组件化通信的不同。react中我们通过使用回调函数来进行通信的，而Vue中子组件向父组件传递消息有两种方式：事件和回调函数
- diff算法不同。react主要使用diff队列保存需要更新哪些DOM，得到patch树，再统一操作批量更新DOM。Vue 使用双向指针，边对比，边更新DOM