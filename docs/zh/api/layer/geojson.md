# GeoJSON 图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_geojson_vue.html"></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions">
  <sm-geojson-layer :layer-style="layerStyle" :data="data"></sm-geojson-layer>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                           | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :--------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| layerStyle | 图层样式                                                       | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -      | -      |
| data       | 图层数据（支持传入 GeoJSON 数据或可访问 GeoJSON 资源的 url） | [GeoJSON](https://geojson.org/) \| string                                                                                                                                                     | -      | -      |
