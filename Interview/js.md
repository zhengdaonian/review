### 异步编程是什么，优缺点

### promise 的优缺点和理解

### 面向过程编程和面向过程编程有什么差异，怎么理解，函数式编程呢

### 全局函数有哪些

### 金额精度丢失前后端怎么处理

### 数组原型链上有哪些方法

### forEach 和 filter 有什么区别

### set 和 map

### 手写防抖

### dom 事件流，一个按钮绑定了冒泡和捕获，点击后触发顺序是什么

### es6，es7 有哪些新特性

### new String('123')和 String('123')有什么区别，new String('123')==String('123')吗，typeof 判断这两个是什么

### 给了个 div 元素,style 为 width:100px;padding:10px;margin:10px;div 的宽度是多少，如果加上 box-sizing:border-box 呢

### 实现正则路径匹配

### 类数组和数组有什么区别

### JS 数据类型有哪些？怎么判断？

### 严格模式 vs 非严格模式区别？

### 箭头函数 vs 普通函数区别与使用场景

### 什么是防抖和节流？ 它们有什么区别 怎么实现

### 超出文本省略 css 和 js 的实现方式, 考虑兼容性

### 什么是柯里化函数，你对柯里化了解多少？

### import 和 require 的区别

### for in 循环对象的时候是有序的吗

### 如果让你从数组中查找元素你会如何实现？

### indexOf 和 includes 有什么区别？

### 箭头函数的 this 会指向什么？

```
 const fn = () => {
        console.log(this);
    }
    const obj = {
        func: fn
    };
    obj.func();

```

```
function fn() {
        console.log(this);
    }
    const obj = {
        func: fn
    };
    obj.func();
```

### call、apply 和 bind 的区别

### 对闭包的理解，闭包产生的方式有哪些

### 如何判断一个值是否是数组

### typeof 和 instanceof 的区别

### 说一下你对 webScoket 的了解，以及有哪些 API

### call apply bind 区别

### 说说了解的 es6-es10 的东西有哪些

### 什么是原型链

### 数组去重得几种方式？

一、利用 ES6 Set 去重（ES6 中最常用）
var arr = [1,1,8,8,12,12,15,15,16,16]; function unique (arr) { return Array.from(new Set(arr)) } console.log(unique(arr)) //[1,8,12,15,16]
二、利用 for 嵌套 for，然后 splice 去重（ES5 中最常用）
var arr = [1, 1, 8, 8, 12, 12, 15, 15, 16, 16]; function unlink(arr) { for (var i = 0; i < arr.length; i++) { // 首次遍历数组 for (var j = i + 1; j < arr.length; j++) { // 再次遍历数组 if (arr[i] == arr[j]) { // 判断连个值是否相等 arr.splice(j, 1); // 相等删除后者 j--; } } } return arr } console.log(unlink(arr));
三、indexOf 去重
var arr = [1, 1, 8, 8, 12, 12, 15, 15, 16, 16]; function unlink(arr) { if (!Array.isArray(arr)) { console.log('错误！') return } var array = []; for (var i = 0; i < arr.length; i++) { // 首次遍历数组 if (array.indexOf(arr[i]) === -1) { // 判断索引有没有等于 array.push(arr[i]) } } return array } console.log(unlink(arr));

### 数组拉平得几种方式？

### 作用域链，继承以及原型链

### 为什么数组长度能任意变化

### 函数的 name 属性，看代码说输出，name 属性能手动修改吗

### new 的过程中发生了什么，实现一个简单的 new，注意顺序

### ES6 默认开启尾递归优化，其原理是什么，为什么能优化

### 用 ES5 实现 const：defineProperty

### 实现一个有节流效果的轮询函数

### 实现一个类，其实例可以链式调用，它有一个 sleep 方法，可以 sleep 一段时间后再后续调用

### async/await 的错误怎么捕获

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

### 实现一个能顺利执行 next 中间件的函数：函数柯里化

### 解析 url 中的 query 参数

### 闭包是什么，闭包得用途

### class 继承转成 es5,实际上就是 class 的实现

### 写个 debounce，加个立即执行怎么加

### Set 和 Map

```
var foo = 1;
function fn() {
    foo = 3;
    return;
    funciton foo() {
        // todo
    }
}
fn();
console.log(foo);
```
