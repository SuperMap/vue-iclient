# 飞行定位

<sm-iframe src="https://iclient.supermap.io/examples/component/components_flyTo_vue.html"></sm-iframe>

```vue
<template>
  <sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
    <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" />
  </sm-web-map>
</template>

<script>
new Vue({
  el: '#main',
  data() {
    return {
      data: [
        [116.3903883, 39.9136222],
        [105.68580487277251, 38.8400787556366],
        [108.94619230956272, 34.35034526669675]
      ],
      flyOptions: {
        duration: 2000,
        bearing: -26,
        zoom: 8.2,
        pitch: 60
      }
    };
  }
});
</script>
```

### Attributes

| 参数           | 说明                                                                            | 类型                                                                       | 可选值                                                       | 默认值                          |
| :------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------ |
| data           | 坐标，支持自定义坐标和飞行配置项                                                | array<[number, number]> \| array<<a href="#customobject">CustomObject</a>> | -                                                            | -                               |
| flyOptions     | [默认飞行配置项](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#flyto)（data 数据项中没有自定义飞行配置项时，默认飞行配置项才生效。）       | object                                                                     | -                                                            | -                               |
| autoplay       | 是否自动播放                                                                    | boolean                                                                    | -                                                            | true                            |
| interval       | 自动播放的时间间隔，单位为毫秒                                                  | number                                                                     | -                                                            | 3000                            |
| immediate      | 首次加载时是否立即播放                                                            | boolean                                                                    | -                                                            | false                           |
| loop           | 是否循环播放                                                                    | boolean                                                                    | -                                                            | true                            |
| initialIndex   | 首次加载播放的数据项索引，从 0 开始                                           | number                                                                     | -                                                            | 0                               |
| activeIndex    | 激活播放的数据项索引，从 0 开始                                               | number                                                                     | -                                                            | -                               |
| showController | 是否显示控制器界面                                                              | boolean                                                                    | -                                                            | true                            |
| position       | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                                                     | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                      |
| iconClass      | 收缩按钮 Icon 类名                                                              | string                                                                     | -                                                            | 'sm-components-icon-layer-list' |
| headerName     | 标题名                                                                          | string                                                                     | -                                                            | '飞行定位'                      |
| autoRotate     | 收缩按钮是否自动旋转                                                            | boolean                                                                    | -                                                            | false                           |
| collapsed      | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean                                                                    | -                                                            | true                            |
| splitLine      | 标题与内容的分割线                                                              | boolean                                                                    | -                                                            | false                           |

### CustomObject

| 参数       | 说明                                                                  | 类型   | 可选值 | 默认值 |
| :--------- | :-------------------------------------------------------------------- | :----- | :----- | :----- |
| location   | 中心点坐标                                                            | array  | -      | -      |
| flyOptions | [飞行配置项](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#flyto) | object | -      | -      |
