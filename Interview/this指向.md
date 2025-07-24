```
var a = 10

var foo = {

a: 20,

b: function () {

var a = 30;

return this.a;

},

// 箭头函数没有this，向外层最近的函数找

c: () => {

var a = 40;

return this.a;

},

}

var d = {

a: 50,

}

console.log(a) // 10

console.log(foo.b()) // this指向调用它的对象 20

console.log(foo.c()) // underfind

console.log(foo.b.bind(d)()) // 50

console.log(foo.c.bind(d)()) // underfind

```