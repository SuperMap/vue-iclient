# 图表专题图

<sm-iframe src="https://iclient.supermap.io/examples/component/components_graph_theme_layer_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="1329428269" @load="mapIsLoaded">
  <sm-graph-theme-layer
    :options="themeOptions"
    :data="features"
    layer-name="pieThemeLayer"
    charts-type="Pie"
    @load="layerLoaded"
  >
  </sm-graph-theme-layer>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                                                                        | 类型                                                                                                                                                                                            | 可选值                   | 默认值 |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- | :----- |
| layerName  | 图层名                                                                                                                      | string                                                                                                                                                                                          | -                        | -      |
| chartsType | 图表类别                                                                                                                    | string                                                                                                                                                                                          | 'Bar' \| 'Line' \| 'Pie' | 'Bar'  |
| options    | 图层可选参数，参照 [SuperMap iClient API](https://iclient.supermap.io/docs/mapboxgl/GraphThemeLayer.html) | object                                                                                                                                                                                          | -                        | -      |
| data       | 图层数据                                                                                                                    | [mapboxgl.supermap.ThemeFeature](https://iclient.supermap.io/docs/mapboxgl/ThemeFeature.html) \| [mapboxgl.supermap.ServerFeature](https://iclient.supermap.io/docs/mapboxgl/ServerFeature.html) | -                        | -      |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)

### Events

| name | 说明             | 回调参数     | 参数说明                                       |
| :--- | :--------------- | :----------- | :--------------------------------------------- |
| load | 图层加载完成事件 | function(layer, map) | layer 指创建的图层实例， map 指关联的 map 实例 |
