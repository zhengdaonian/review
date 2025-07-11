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
