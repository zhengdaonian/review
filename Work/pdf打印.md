## 页面打印 pdf

### 方案一

`
export function printHtml(html) {
const style = getStyle();
const container = getContainer(html);

document.body.appendChild(style);
document.body.appendChild(container);

getLoadPromise(container).then(() => {
window.print();
document.body.removeChild(style);
document.body.removeChild(container);
});
}

// 设置打印样式
function getStyle() {
const styleContent = `#print-container {
    display: none;
	}
	@media print {
		@page {
			margin: 0;
		}
    body > :not(.print-container) {
        display: none;
    }
    html,
    body {
				margin: 1cm;
				-webkit-print-color-adjust: exact;
        display: block !important;
    }
    #print-container {
        display: block;
    }
		.n-input.n-input--textarea .n-input__textarea-el {
			display: none !important;
		}
		.n-input.n-input--textarea .n-input__textarea-mirror{
			visibility: inherit !important;
		}
	}`;
const style = document.createElement('style');
style.innerHTML = styleContent;
return style;
}

// 清空打印内容
function cleanPrint() {
const div = document.getElementById('print-container');
if (div) {
document.querySelector('body').removeChild(div);
}
}

// 新建 DOM，将需要打印的内容填充到 DOM
function getContainer(html) {
cleanPrint();
const container = document.createElement('div');
container.setAttribute('id', 'print-container');
container.innerHTML = html;
return container;
}

// 图片完全加载后再调用打印方法
function getLoadPromise(dom) {
let imgs = dom.querySelectorAll('img');
imgs = [].slice.call(imgs);

if (imgs.length === 0) {
return Promise.resolve();
}

let finishedCount = 0;
return new Promise(resolve => {
function check() {
finishedCount++;
if (finishedCount === imgs.length) {
resolve();
}
}
imgs.forEach(img => {
img.addEventListener('load', check);
img.addEventListener('error', check);
});
});
}

`

### 方案二 html2canvas + jspdf

`
npm install --save html2canvas
npm install --save jspdf
// utils/htmlToPdf.js：导出页面为 PDF 格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
install(Vue, options) {
// id-导出 pdf 的 div 容器；title-导出文件标题
Vue.prototype.htmlToPdf = (id, title) => {
const element = document.getElementById(`${id}`)
const opts = {
scale: 12, // 缩放比例，提高生成图片清晰度
useCORS: true, // 允许加载跨域的图片
allowTaint: false, // 允许图片跨域，和 useCORS 二者不可共同使用
tainttest: true, // 检测每张图片已经加载完成
logging: true // 日志开关，发布的时候记得改成 false
}

      html2Canvas(element, opts)
        .then((canvas) => {
          console.log(canvas)
          const contentWidth = canvas.width
          const contentHeight = canvas.height
          // 一页pdf显示html页面生成的canvas高度;
          const pageHeight = (contentWidth / 592.28) * 841.89
          // 未生成pdf的html页面高度
          let leftHeight = contentHeight
          // 页面偏移
          let position = 0
          // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
          const imgWidth = 595.28
          const imgHeight = (592.28 / contentWidth) * contentHeight
          const pageData = canvas.toDataURL('image/jpeg', 1.0)
          console.log(pageData)
          // a4纸纵向，一般默认使用；new JsPDF('landscape'); 横向页面
          const PDF = new JsPDF('', 'pt', 'a4')

          // 当内容未超过pdf一页显示的范围，无需分页
          if (leftHeight < pageHeight) {
            // addImage(pageData, 'JPEG', 左，上，宽度，高度)设置
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
          } else {
            // 超过一页时，分页打印（每页高度841.89）
            while (leftHeight > 0) {
              PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight
              position -= 841.89
              if (leftHeight > 0) {
                PDF.addPage()
              }
            }
          }
          PDF.save(title + '.pdf')
        })
        .catch((error) => {
          console.log('打印失败', error)
        })
    }

}
}

<template>
  <div>
      <div
       id="pdfDom"
      >
        测试数据
      </div>
      <el-button type="primary" round style="background: #4849FF" @click="btnClick">导出PDF</el-button>
    </div>
 </template>
 <script>
 import JsPDF from 'jspdf'
 import html2Canvas from 'html2canvas'
 methods: {
    // 导出pdf
    btnClick() {
     this.$nextTick(() => {
         this.htmlToPdf('pdfDom', '个人报告')
     })
    },
  },
 </script>

`

页面转码时间会长
可以考虑在页面初始化完成后就对页面进行抓取绘制及转码，将转码数据保存，在点击下载时直接生成 pdf 并保存。
html2canvas 能够抓取的页面长度大约为 1440，两个 A4 页面左右，超出不会抓取，需要控制多个节点，循环绘制。

### 方案三 puppeteer

[nuxt3 搭建中间层服务 html 生成 PDF 方案： 基于 nuxt3 + puppeteer](https://juejin.cn/post/7165902819701522445?share_token=9d11665e-e167-4c65-baab-3068fa4df1ea)

`
var express = require('express');
var app = express();
// 路由中间件：get 请求"/"资源
app.get('/', function (req, res) {
res.send('Hello11 World!');
});

app.listen(3000, function () {
console.log('Example app listening on port 3000!');
});

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {

    //指定存放pdf的文件夹
    const folder = 'vueDoc'
    fs.mkdir(folder, () => { console.log('文件夹创建成功') })

    //启动无头浏览器
    const browser = await puppeteer.launch({ headless: true }) //PDF 生成仅在无界面模式支持, 调试完记得设为 true
    const page = await browser.newPage();
    await page.goto('https://cn.vuejs.org/v2/guide/index.html'); //默认会等待页面load事件触发
    //指定生成的pdf文件存放路径
    await page.pdf({ path: `./vueDoc/guide.pdf` });
    //关闭页面
    page.close()
    //关闭 chromium
    browser.close();

})()
`

`
var express = require('express');
var app = express();
// 路由中间件：get 请求"/"资源
app.get('/', function (req, res) {
res.send('Hello11 World!');
});

app.listen(3000, function () {
console.log('Example app listening on port 3000!');
});

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {

    //指定存放pdf的文件夹
    const folder = 'vueDoc'
    fs.mkdir(folder, () => { console.log('文件夹创建成功') })

    //启动无头浏览器
    const browser = await puppeteer.launch({ headless: true }) //PDF 生成仅在无界面模式支持, 调试完记得设为 true
    const page = await browser.newPage();
    await page.goto('https://cn.vuejs.org/v2/guide/index.html'); //默认会等待页面load事件触发
    // 1) 已知Vue文档左侧菜单结构为：.menu-root>li>a
    // 获取所有一级链接
    const urls = await page.evaluate(() => {
        return new Promise(resolve => {
            const aNodes = $('.menu-root>li>a')
            const urls = aNodes.map(n => {
                return aNodes[n].href
            })
            resolve(urls);
        })
    })

    // 2）遍历 urls, 逐个访问并生成 pdf
    let successUrls = [], failUrls = [] // 用于统计成功、失败情况
    for (let i = 17; i < urls.length; i++) {
        const url = urls[i],
            tmp = url.split('/'),
            fileName = tmp[tmp.length - 1].split('.')[0]
        try {
            await page.goto(url); //默认会等待页面load事件触发
            await page.pdf({ path: `./${folder}/${i}_${fileName}.pdf` }); //指定生成的pdf文件存放路径
            console.log(`${fileName}.pdf 已生成！`)
            successUrls.push(url)
        } catch {
            //如果页面打开超时，会抛出错误。为了保证后面的页面生成不被影响，这里做一下容错处理。
            failUrls.push(url)
            console.log(`${fileName}.pdf 生成失败！`)
            continue
        }
    }

    console.log(`PDF生成完毕！成功${successUrls.length}个，失败${failUrls.length}个`)
    console.log(`失败详情：${failUrls}`)

    //TODO: 失败重试

    page.close()
    browser.close();

})()
`

### 方案四 pdfmake

这个也行

没什么大需求用一或者二都行，细致一点方案三
