## 介绍一下标准的 CSS 的盒子模型？与低版本 IE 的盒子模型有什么不同的？

- 标准盒子模型：宽度=内容的宽度（content）+ border + padding + margin
- 低版本 IE 盒子模型：宽度=内容宽度（content+border+padding）+ margin

## box-sizing 属性？

在 CSS 中，box-sizing 属性定义了浏览器应该如何计算一个元素的总宽度和总高度。这个属性有两个主要值：content-box 和 border-box。

当没有设置 box-sizing 属性时默认是 content-box，也就是标准盒模型，当我们需要转变成怪异盒模型时，只需要设置 box-sizing: border-box。

## 怎么清除浮动

设置浮动后 display 自动变成 block
由于父元素没写高度时，子元素浮动后会导致父元素发生调试塌陷，所以需要清除浮动

- 给父级设置 overflow: hidden
- 给父级设置高度
- 父级也设置成浮动
- 浮动元素下添加空标签 div 并设置 CSS 样式:{ clear: both;height:0;overflow:hidden }
- 使用伪类

## 几种隐藏得区别

- visibility: hidden：隐藏元素，会继续在文档流中占位，所以触发重绘，隐藏后不触发点击事件。
- display: none: 隐藏元素，会从页面中删掉，所以会触发重排和重绘
- opacity:0：透明，会继续在文档流中占位，所以触发重绘。由是是作用于元素自身，所以子元素会继承，全部变透明，透明后可以触发点击事件
- rgba(0,0,0,0)：透明，会继续在文档流中占位，所以触发重绘。由于只作用于颜色或背景色，所以子元素不会继承，透明后可以触发点击事件
- 另外 transition 过渡不支持 display:none，其他三个是支持的
-

### font-size 的 px 是基于什么而定的（屏幕像素），是决定了字体的长宽还是什么？

### 谈谈你对 display:flex 弹性盒子属性的了解

### css 中的 animation、transition、transform 有什么区别？

### 怪异模式下 100\*100，padding 为 50 的盒子显示的宽高为多少
