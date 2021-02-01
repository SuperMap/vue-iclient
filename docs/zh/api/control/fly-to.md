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
| flyOptions     | [飞行配置项](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#flyto)           | object                                                                     | -                                                            | -                               |
| data           | 定位配置项                                                                      | array<[number, number]> \| array<<a href="#customobject">CustomObject</a>> | -                                                            | -                               |
| autoplay       | 是否自动切换                                                                    | boolean                                                                    | -                                                            | true                            |
| interval       | 自动切换的时间间隔，单位为毫秒                                                  | number                                                                     | -                                                            | 3000                            |
| immediate      | 指定在延迟开始前调用                                                            | boolean                                                                    | -                                                            | false                           |
| loop           | 是否循环切换                                                                    | boolean                                                                    | -                                                            | true                            |
| initialIndex   | 初始状态激活的数据项的索引，从 0 开始                                           | number                                                                     | -                                                            | 0                               |
| activeIndex    | 当前激活的数据项的索引，从 0 开始                                               | number                                                                     | -                                                            | 0                               |
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

> 注意：flyOptions 优先级为 data 数据项中的 flyOptions > 全局 flyOptions, 传入 props 时，优先级高的直接生效，优先级低的则失效。
