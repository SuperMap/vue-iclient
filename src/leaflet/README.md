# vue-iclient-leaflet

## 简介
* 官网：[https://iclient.supermap.io](https://iclient.supermap.io)
* 源码：[https://github.com/SuperMap/vue-iclient](https://github.com/SuperMap/vue-iclient)

## 安装

```
npm install @supermap/vue-iclient-leaflet
```

## 开发

在 main.js 中写入以下内容：

```js
import Vue from 'vue';
import VueiClient from '@supermap/vue-iclient-leaflet';
import App from './App.vue';

Vue.use(VueiClient);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

## 示例
 [https://iclient.supermap.io/examples/component/examples.html#vuecomponents_leaflet](https://iclient.supermap.io/examples/component/examples.html#vuecomponents_leaflet)