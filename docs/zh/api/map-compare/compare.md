# 地图卷帘

地图卷帘组件，支持加载 [iPortal 地图](/zh/api/web-map/map.md#加载-iportal-地图)和 [iServer 地图](/zh/api/web-map/map.md#加载-iserver-地图)。

<sm-iframe src="https://iclient.supermap.io/examples/component/components_compare_vue.html"></sm-iframe>

传参方式：

```vue
<template>
  <sm-compare
    :before-map-options="beforeMapOptions"
    :after-map-options="afterMapOptions"
  >
  <sm-compare>
</template>
<script>
export default {
  data() {
    return {
      beforeMapOptions: {
        target: 'beforeMap',
        serverUrl: 'https://iportal.supermap.io/iportal',
        mapId: 801571284
      },
      afterMapOptions: {
        target: 'afterMap',
        serverUrl: 'https://iportal.supermap.io/iportal',
        mapId: 491609698
      }
    };
  }
};
</script>
```

slot 方式：

```vue
<template>
  <sm-compare>
    <sm-web-map
      slot="beforeMap"
      target="beforeMap"
      server-url="https://iportal.supermap.io/iportal"
      :map-id="801571284"
    >
    </sm-web-map>
    <sm-web-map
      slot="afterMap"
      target="afterMap"
      server-url="https://iportal.supermap.io/iportal"
      :map-id="491609698"
    >
    </sm-web-map>
  </sm-compare>
</template>
```

### Attributes

| 参数             | 说明                 | 类型                                            | 可选值 | 默认值                 |
| :--------------- | :------------------- | :---------------------------------------------- | :----- | :--------------------- |
| target           | 容器 ID              | string                                          | -      | 'comparison-container' |
| orientation      | 滑块方向             | string                                          | -      | 'vertical'             |
| mousemove        | 滑块是否跟随鼠标移动 | boolean                                         | -      | false                  |
| beforeMapOptions | 地图参数             | [mapOptions](/zh/api/web-map/map.md#attributes) | -      | -                      |
| afterMapOptions  | 地图参数             | [mapOptions](/zh/api/web-map/map.md#attributes) | -      | -                      |
| beforeMap        | 地图组件             | slot                                            | -      | -                      |
| afterMap         | 地图组件             | slot                                            | -      | -                      |
| lineSize         | 分割线宽度           | number                                          | -      | 2                      |
| slideSize        | 滑块大小             | number                                          | -      | 60                     |
| slideBackground  | 滑块背景颜色         | string                                          | -      | -                      |
| autoresize       | 是否响应容器自适应   | boolean                                         | -      | true                   |

> 注意：Compare 组件中渲染的优先级为 [beforeMapOptions, afterMapOptions] > [beforeMap, afterMap]，即 props > slot 。 且以 slot 方式加载的地图组件应分发 [load](/zh/api/web-map/map.md#events) 事件，以便于获得 map 实例。
