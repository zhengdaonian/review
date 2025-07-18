### 异步编程是什么，优缺点

### promise的优缺点和理解

### 面向过程编程和面向过程编程有什么差异，怎么理解，函数式编程呢

### 全局函数有哪些

### 金额精度丢失前后端怎么处理

### 数组原型链上有哪些方法

### forEach和filter有什么区别

### set和map


### 手写防抖

### dom事件流，一个按钮绑定了冒泡和捕获，点击后触发顺序是什么


### es6，es7有哪些新特性

### new String('123')和String('123')有什么区别，new String('123')==String('123')吗，typeof判断这两个是什么

### 给了个div元素,style为width:100px;padding:10px;margin:10px;div的宽度是多少，如果加上box-sizing:border-box呢

### 实现正则路径匹配

### 类数组和数组有什么区别

### JS 数据类型有哪些？怎么判断？

### 严格模式 vs 非严格模式区别？

### 箭头函数 vs 普通函数区别与使用场景

### 什么是防抖和节流？ 它们有什么区别 怎么实现

### 超出文本省略css和js的实现方式, 考虑兼容性

### 什么是柯里化函数，你对柯里化了解多少？

### import 和 require的区别

### 如何控制请求并发数量？


### for in循环对象的时候是有序的吗


### 如果让你从数组中查找元素你会如何实现？

### indexOf和includes有什么区别？

### 箭头函数的this会指向什么？
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

### call、apply和bind的区别

### 对闭包的理解