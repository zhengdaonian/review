function Person(name, age) {
    this.name = name;
    this.age = age;
    return {
        name:this.name,
        age:this.age,
        tag:'haha'
    }
}

Person.prototype.sayName = function () {
    console.log(this.name);
}
// 手写new
function objectFactory(fn, ...args) {
    // arguments 所有参数 类数组
    // 1. 空对象创建
    // const obj = new Object();  
    const obj = {};
    // 2. 设置原型链
    obj.__proto__ = fn.prototype;
    // 3. 绑定this值 + 4. 执行构造函数
    const result = fn.apply(obj, args);  // 返回值
    // 5. 返回值处理
    // 如果返回对象 返回对象     
    // 如果返回简单数据类型或者没有  就返回 obj   可以是null（空对象）
    return typeof result === "object" ? result : obj;
}

// 检测 
let awei = objectFactory(Person, 'awei', 20)
// console.log(awei.name);
// awei.sayName();
console.log(awei);
