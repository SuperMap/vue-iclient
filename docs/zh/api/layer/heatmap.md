# 热力图图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_heatmap_vue.html"></sm-iframe>

```html
<sm-web-map :map-options="mapOptions">
  <sm-heatmap-layer :data="data" :layer-style="heatMapStyle"></sm-heatmap-layer>
</sm-web-map>
```

### Attributes

| 参数       | 说明       | 类型                            | 可选值 | 默认值 |
| :--------- | :--------- | :------------------------------ | :----- | :----- |
| data       | 热力图数据 | [GeoJSON](https://geojson.org/) | -      | -      |
| layerStyle | 图层样式   | [HeatMapStyle](/zh/api/common-types/common-types.md#heatmapstyle)                    | -      | -      |
