# 自定义主题

Vue-iClient-MapboxGL 内置了 [13 套主题](https://github.com/SuperMap/vue-iclient/blob/master/src/common/_utils/style/theme/theme.json)，CSS 命名采用 BEM 的风格，方便使用者覆盖样式。

你可以通过以下方式定义主题。

### 使用 Vue-iClient-MapboxGL 内置主题

```js
// 完整引入Vue-iClient-MapboxGL
import Vue from 'vue';
import VueiClient from '@supermapgis/vue-iclient-mapboxgl';
import App from './App.vue';

// 可以通过两种方式使用内置主题
// 1 初始化组件时传入主题配置
Vue.use(VueiClient, { theme: 'light' });

// 2 通过 setTheme 方法设置主题
VueiClient.setTheme('light');
```

或

```js
// 按需引入Vue-iClient-MapboxGL
import Vue from 'vue';
import { Button } from '@supermapgis/vue-iclient-mapboxgl';
import { setTheme } from '@supermapgis/vue-iclient-mapboxgl/lib/_utils/style/theme/set-theme'; // 需要引用具体的路径

// 通过 setTheme 方法设置主题。
setTheme('light');

Vue.use(Button);
```

### 使用自定义主题

你需要定义一个 theme 对象，包含 `textColor` `componentBackground` `colorGroup` 三个属性。

| 参数                | 说明     | 类型      | 可选值 | 默认值 |
| :------------------ | :------- | :-------- | :----- | :----- |
| textColor           | 字体颜色 | string    | -      | -      |
| componentBackground | 背景颜色 | string    | -      | -      |
| colorGroup          | 颜色数组 | string[ ] | -      | -      |

> 以上是一些最常用的通用变量，所有样式变量可以在 [这里](https://github.com/SuperMap/vue-iclient/blob/dev/src/common/_utils/style/theme/theme.json) 找到。

如下例所示：

```js
// 完整引入Vue-iClient-MapboxGL
import Vue from 'vue';
import VueiClient from '@supermapgis/vue-iclient-mapboxgl';
import App from './App.vue';

let theme = {
  textColor: '#eee',
  componentBackground: 'rgba(0,0,0,0)',
  colorGroup: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']
};

Vue.use(VueiClient, { theme });
// 或
VueiClient.setTheme(theme);
```

或

```js
// 按需引入Vue-iClient-MapboxGL
import { Button } from '@supermapgis/vue-iclient-mapboxgl';
import { setTheme } from '@supermapgis/vue-iclient-mapboxgl/lib/_utils/style/theme/set-theme'; // 需要引用具体的路径

let theme = {
  textColor: '#eee',
  componentBackground: 'rgba(0,0,0,0)',
  colorGroup: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']
};

setTheme(theme);

Vue.use(Button);
```

<!-- 以上就完成了主题的设置，如果你想单独改变某个组件的主题样式，你可以为这个组件传递 `textColor` `background` `colorGroup` 这三个其中之一的参数，来改变这个组件的主题样式。 -->
