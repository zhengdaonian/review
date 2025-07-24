### 手写 eventEmitter

跟 promise class 一样，先搭建一个框架：
class EventEmitter {
constructor() {
this.events = {}
}
emit (eventName, args) {}
on (eventName, callback) {}
off (eventName, callback?) {}
}
