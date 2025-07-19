### Webpack为什么启动慢?Vite为什么启动快?

Vite它借助了浏览器对ESM规范的支持，采取了与Webpack完全不同的unbundle机制


### Vite有什么缺点？极致的快，消耗的代价是什么？
unbundle机制给Vite在dev server方面获得巨大的性能提升，但也带来了一些代价，那就是首屏和懒加载的性能下降

#### 首屏问题
由于unbundle机制，首屏期间需要额外做一些工作
1. 不对源文件做合并捆绑操作，导致大量的http请求
2. dev server运行期间对源文件做resolve、load、transform、parse操作
3. 预构建、二次预构建操作也会阻塞首屏请求，直到预构建完成为止

相对比于webpack，Vite把需要在dev server启动过程中完成的工作，转移到dev server响应浏览器请求的过程中，所以不可避免的导致首屏性能下降；不过首屏性能差只发生在dev server启动以后第一次加载页面时发生；之后reload页面时，首屏的性能会好很多，因为dev server会将之前已经完成转换的内容缓存起来

#### 懒加载

由于 unbundle 机制，动态加载的文件，需要做 resolve、load、transform、parse 操作，并且还有大量的 http请求，导致懒加载性能也受到影响