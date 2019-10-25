# 分段专题图

<sm-iframe src="http://iclient.supermap.io/examples/component/components_rangetheme_vue.html"></sm-iframe>

```html
<sm-web-map :map-options="mapOptions" @load="mapIsLoaded">
  <sm-range-theme-layer
    :options="themeOptions"
    :data="features"
    layer-name="RangeThemeLayer"
    @load="layerLoaded"
  >
  </sm-range-theme-layer>
</sm-web-map>
```

### Attributes

| 参数      | 说明                                                                                                                       | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :-------- | :------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| layerName | 图层名                                                                                                                     | string                                                                                                                                                                                        | -      | -      |
| options   | 图层可选参数，参照 [SuperMap iClient API](http://iclient.supermap.io/docs/mapboxgl/mapboxgl.supermap.RangeThemeLayer.html) | object                                                                                                                                                                                        | -      | -      |
| data      | 图层要素数据                                                                                                               | [mapboxgl.supermap.ThemeFeature](http://iclient.supermap.io/docs/mapboxgl/mapboxgl.supermap.ThemeFeature.html) \| [SuperMap.ServerFeature](http://iclient.supermap.io/web/apis/mapboxgl.html) | -      | -      |

### Events

| name | 说明             | 回调参数   |
| :--- | :--------------- | :--------- |
| load | 图层加载完成事件 | 关联的 map |