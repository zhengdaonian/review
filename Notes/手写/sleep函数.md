### 实现一个类，其实例可以链式调用，它有一个 sleep 方法，可以 sleep 一段时间后再后续调用

【代码题】实现一个同步的 sleep 方法
调用方式：(new LazyLog()).log(1).sleep(1000).log(2)
输出：先输出 1，延迟 1 秒后输出 2

```
//  一开始我的想法是通过Promise去实现sleep，后来发现Promise的话无法满足直接的链式调用方式
//  面完之后下来查了一下，发现可以通过死循环去实现同步的sleep，但是这种方式对性能有极大的影响
//  在某些环境下会执行报错，后来又去查了一下开源的sleep库https://www.npmjs.com/package/sleep
//  发现它的最终也是通过c++原生代码编译成node模块来实现的，所以这个问题有没有啥更好的答案呢🤔
class LazyLog {
  log(str) {
    console.log(str)
    return this;
  }

  // async sleep(delay) {
  //   await new Promise(resolve => setTimeout(() => resolve(), delay));
  //   return this;
  // }

  sleep(delay) {
    const current = Date.now();
    while (Date.now() - current < delay) {
      // 什么都不做
    }
    return this;
  }
}

```
