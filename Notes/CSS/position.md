## position 属性

1. position: static; 默认值。正常文档流，没有定位
2. position: inherit; 继承父元素
3. position: relative; 相对定位；正常文档流，相对自身定位
4. position: absolute; 绝对定位；脱离文档流，相对上级有 position 属性且值不为 static 得元素定位，若没有相对 body 定位
5. position: fixed; 固定定位；脱离文档流，相对于浏览器窗口定位
6. position: sticky; 粘性定位；根据窗口滚动自动切换 relative 和 fixed，由 top 决定
