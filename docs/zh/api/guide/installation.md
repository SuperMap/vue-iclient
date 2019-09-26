# 安装

你可以通过以下两种方式安装 Vue-iClient。

### npm

推荐使用 npm 的方式安装，它能更好地和 [webpack](https://webpack.js.org/) 打包工具配合使用。

使用此方式前请先检查电脑中是否已安装应用程序 [Node.js](https://nodejs.org/zh-cn/)，若未安装，可通过下载 [安装程序](https://nodejs.org/zh-cn/) 来安装。然后在命令行中输入以下命令安装 SuperMap Vue-iClient：

```
npm install @supermap/vue-iclient
```

如果您使用了 npm 安装，并使用 webpack 作为构建工具，请继续阅读[快速上手章节](./quick-start.md)。

### CDN

获取文件后，只需要像普通的 JavaScript 库一样用 &lt;script&gt; 标签引入即可。

以下详细介绍如何通过 [在线站点](http://iclient.supermap.io/) 引入 SuperMap Vue-iClient。

新建一个 HTML 文件，在 &lt;head&gt; 标签中引入如下文件：

- 引入 Vue.js 文件

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
```

- 引入 ant-design-vue JS 和 CSS 文件

```html
<link href="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.10/dist/antd.min.css" rel="stylesheet" />
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.10/dist/antd.min.js"></script>
```

- 引入 MapboxGL-enhange JS 和 CSS 文件

```html
<link href="http://iclient.supermap.io/web/libs/mapbox-gl-js-enhance/1.2.0/mapbox-gl-enhance.css" rel="stylesheet" />
<script type="text/javascript" src="http://iclient.supermap.io/web/libs/mapbox-gl-js-enhance/1.2.0/mapbox-gl-enhance.js" ></script>
```

- 引入 iclient-mapboxgl JS 和 CSS 文件

```html
<link href="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl.min.css" rel="stylesheet" />
<script type="text/javascript" src="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl-es6.min.js"></script>
```

- 引入 Vue-iClient JS 和 CSS 文件

```html
<link href="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl-vue.css" rel="stylesheet" />
<script type="text/javascript" src="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl-vue.min.js"></script>
```

#### 示例

通过引入文件方式可以快速使用 Vue-iClient 写出一个示例，您可以复制下面代码或参考此在线[示例](http://iclient.supermap.io/dev/examples/component/editor.html#components_webmap_vue)。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>vue-iclient example</title>
    <link href="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.10/dist/antd.min.css" rel="stylesheet" />
    <link href="http://iclient.supermap.io/web/libs/mapbox-gl-js-enhance/1.2.0/mapbox-gl-enhance.css" rel="stylesheet" />
    <link href="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl.min.css" rel="stylesheet" />
    <link href="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl-vue.css" rel="stylesheet" />
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.10/dist/antd.min.js"></script>
    <script type="text/javascript" src="http://iclient.supermap.io/web/libs/mapbox-gl-js-enhance/1.2.0/mapbox-gl-enhance.js" ></script>
    <script type="text/javascript" src="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl-es6.min.js" ></script>
    <script type="text/javascript" src="http://iclient.supermap.io/dev/dist/mapboxgl/iclient-mapboxgl-vue.min.js" ></script>
    <style>
      #main {
        margin: 0 auto;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body style="margin: 0; overflow: hidden; background: #fff; width: 100%; height:100%; position: absolute; top: 0;">
    <div id="main">
      <sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980"></sm-web-map>
    </div>
    <script>
      new Vue({
        el: '#main'
      });
    </script>
  </body>
</html>
```
