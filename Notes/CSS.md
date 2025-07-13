## 什么是 BFC、可以解决哪些问题

### 一、BFC 是什么？

[可能是最好的 BFC 解析了...](https://juejin.cn/post/6960866014384881671#heading-2)

BFC：block formatting context 块状格式化上下文

理解：BFC 元素可以理解成被隔离的区间（BFC 的子元素不会对外面的元素产生影响）；

- 块级元素会在垂直方向一个接一个的排列，和文档流的排列方式一致。
- 在 BFC 中上下相邻的两个容器的 margin 会重叠，创建新的 BFC 可以避免外边距重叠。
- 计算 BFC 的高度时，需要计算浮动元素的高度。
- BFC 区域不会与浮动的容器发生重叠。
- BFC 是独立的容器，容器内部元素不会影响外部元素。
- 每个元素的左 margin 值和容器的左 border 相接触。

### 二、BFC 如何触发？

如何让一个元素变成 BFC，触发规则如下：

- float:left | right
- overflow:hidden | scroll | auto; （不是 visible）
- display:inline-block | table-cell | table-caption | flex | grid ;（ 非 none 非 inline 非 block）
- position: absolute | fiexed ;（ 非 relative）
- bfc 解析

### BFC 能解决什么问题？

BFC 能解决：

- margin 重合问题
- margin 塌陷问题
- 高度塌陷问题

## position 属性

1. position: static; 默认值。没有定位
2. position: inherit; 继承父元素
3. position: relative; 相对定位；正常文档流，相对自身定位
4. position: absolute; 绝对定位；脱离文档流，相对上级有position属性且值不为static得元素定位，若没有相对body定位
5. position: fixed; 固定定位；脱离文档流，相对于浏览器窗口定位
6. position: sticky; 粘性定位；根据窗口滚动自动切换relative和fixed，由top决定

## 怎么开启动画加速，底层原理是什么

- 用到了 3D 或者 transform、video、canvas、CSS filters（滤镜），opacity(透明度)
- 浏览器接收到页面文档后，会将文档中的标记语言解析为 DOM 树。DOM 树和 CSS 结合后形成浏览器构建页面的渲染树。渲染树中包含了大量的渲染元素，每一个渲染元素会被分到一个图层中，每个图层又会被加载到 GPU 形成渲染纹理，而图层在 GPU 中 transform 是不会触发 repaint 的，这一点非常类似 3D 绘图功能，最终这些使用 transform 的图层都会由独立的合成器进程进行处理
- 优点：
  <br />
  由于 GPU 中的 transform 等 CSS 属性不触发 repaint，因此不需要重绘，单独处理，所以能大大提高网页的性能
- 缺点：
  <br />
  过多的使用 GPU 处理会导致内存问题，可能导致浏览器崩溃。
  <br />
  在 GPU 渲染字体会导致抗锯齿无效，因为 GPU 和 CPU 的算法不同，因此即使最终硬件加速停止了，文本还是会在动画期间显示的很模糊，尽量不要包含文字。

## 重拍重绘得理解

- 重排：无论通过什么方式影响了元素的几何信息(元素在视口内的位置和尺寸大小)，浏览器需要重新计算元素在视口内的几何属性，这个过程叫做重排。
- 重绘：通过构造渲染树和重排（回流）阶段，我们知道了哪些节点是可见的，以及可见节点的样式和具体的几何信息(元素在视口内的位置和尺寸大小)，接下来就可以将渲染树的每个节点都转换为屏幕上的实际像素，这个阶段就叫做重绘。

<strong>最小化重绘和重排：</strong>比如样式集中改变，使用添加新样式类名 .class 或 cssText 。
<br />
<strong>批量操作 DOM：</strong>比如读取某元素 offsetWidth 属性存到一个临时变量，再去使用，而不是频繁使用这个计算属性；又比如利用 document.createDocumentFragment() 来添加要被添加的节点，处理完之后再插入到实际 DOM 中。
<br />
<strong>使用 `absolute` 或 `fixed` 使元素脱离文档流</strong>，这在制作复杂的动画时对性能的影响比较明显。
<br />
<strong>开启 GPU 加速</strong>，利用 css 属性 transform 、will-change 等，比如改变元素位置，我们使用 translate 会比使用绝对定位改变其 left 、top 等来的高效，因为它不会触发重排或重绘，transform 使浏览器为元素创建⼀个 GPU 图层，这使得动画元素在一个独立的层中进行渲染。当元素的内容没有发生改变，就没有必要进行重绘。
