# 快速上手

本节将介绍如何在项目中使用。

### 使用之前

高效的开发，离不开基础工程的搭建。在开始使用 Vue-iClient-MapboxGL 之前，有必要先了解以下基础知识，我们也假设您已经写过 Vue，并掌握了下面的内容。

  - [Vue 组件](https://cn.vuejs.org/v2/guide/components.html)
  - [单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html)

以下概念贯穿 Vue-iClient-MapboxGL 前后，建议开发者花点时间来了解。

  - prop 传递数据
  - slot 内容分发
  - events $emit @click 事件

### 引入 Vue-iClient-MapboxGL

在 main.js 中写入以下内容：

```js
import Vue from 'vue';
import VueiClient from '@supermap/vue-iclient-mapboxgl';
import App from './App.vue';

Vue.use(VueiClient);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

以上代码便完成了 Vue-iClient-MapboxGL 的引入。
