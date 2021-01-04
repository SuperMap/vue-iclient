---
pageClass: web-scene
---

# 三维场景

三维场景组件，支持加载 SuperMap iPortal 三维场景和 SuperMap iServer 三维场景。

::: tip
该组件基于 [vue-cesium](https://github.com/zouyaoji/vue-cesium)
:::

在使用三维场景组件之前，你需要在引入 Vue-iClient-MapboxGL 时，传入 Cesium 依赖（你可以点击此处下载 [Cesium](http://support.supermap.com.cn/DownloadCenter/DownloadPage.aspx?id=1159) ），如下所示：

```js
import Vue from 'vue';
import VueiClient from '@supermap/vue-iclient-mapboxgl';

Vue.use(VueiClient, { cesiumPath: './Build/Cesium/Cesium.js' }); // 此 url 路径相对于根目录
```

组件使用方式：

```html
<sm-web-scene sceneUrl="https://iserver.supermap.io/iserver/services/3D-CBD/rest/realspace"></sm-web-scene>
```

### Attributes

| 参数       | 说明                                              | 类型                | 可选值 | 默认值                             |
| :--------- | :------------------------------------------------ | :------------------ | :----- | :--------------------------------- |
| sceneUrl   | SuperMap iPortal 场景或 SuperMap iServer 场景地址 | string              | -      | -                                  |
| cesiumPath | Cesium 插件相对根目录的路径                         | string              | -      | '../../static/libs/Cesium/Cesium.js' |
| options    | 可选参数                                          | [options](#options) | -      | -                                  |

### options

| 参数            | 说明                | 类型                                | 可选值 | 默认值 |
| :-------------- | :------------------ | :---------------------------------- | :----- | :----- |
| withCredentials | 请求是否携带 cookie | boolean                             | -      | false  |
| position        | 场景中心店          | { x: number; y: number; z: number } | -      | -      |
| scanEffect      | 场景扫描参数        | [scanEffect](#scaneffect)           | -      | -      |

### scanEffect

| 参数          | 说明       | 类型                                | 可选值                         | 默认值   |
| :------------ | :--------- | :---------------------------------- | :----------------------------- | :------- |
| status        | 是否扫描   | boolean                             | -                              | false    |
| type          | 扫描类型   | string                              | 'circle' \| 'noScan' \| 'line' | 'noScan' |
| centerPostion | 扫描中心点 | { x: number; y: number; z: number } | -                              | -        |
| period        | 扫描周期   | number                              | -                              | 2000     |
| speed         | 扫描速度   | number                              | -                              | 500      |
