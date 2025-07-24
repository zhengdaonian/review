### 、实现 instanceOf 的 3 种方法

```
function myInstanceof(obj, func) {
	if(!['function', 'object'].includes(typeof obj) || obj === null) {
		// 基本数据类型直接返回false，因为不满足instanceof的左侧参数是对象或者说引用类型
			return false
	}
	let proto = obj.__proto__, prototype = func.prototype
	while(proto !== prototype) {
		// obj.__proto__不等于func.prototype时，继续通过__proto__向上层查找
		// 当找到原型链尽头Object.prototype.__proto__=null 时还未找到，就返回false
		proto = proto.__proto__
		if(proto === null){
			return false
		}
	}
// obj.__proto__ 等于 prototype = func.prototype 时，不会进入上面循环，返回true
// 不等进入上面循环，找到相等时会跳出循环，走到这里返回true
return true
}
```
