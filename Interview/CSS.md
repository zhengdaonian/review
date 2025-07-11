## 介绍一下标准的 CSS 的盒子模型？与低版本 IE 的盒子模型有什么不同的？

- 标准盒子模型：宽度=内容的宽度（content）+ border + padding + margin
- 低版本 IE 盒子模型：宽度=内容宽度（content+border+padding）+ margin

## box-sizing 属性？

在 CSS 中，box-sizing 属性定义了浏览器应该如何计算一个元素的总宽度和总高度。这个属性有两个主要值：content-box 和 border-box。

当没有设置 box-sizing 属性时默认是 content-box，也就是标准盒模型，当我们需要转变成怪异盒模型时，只需要设置 box-sizing: border-box。
