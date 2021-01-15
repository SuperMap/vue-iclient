# 三维拉伸图层

<sm-iframe src="></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions">
  <sm-fill-extrusion-layer :layer-style="layerStyle" :data="data"></sm-fill-extrusion-layer>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                      | 类型                                                                                                                                               | 可选值 | 默认值                            |
| :---------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :-------------------------------- |
| layerId     | 图层名称                                                  | string                                                                                                                                             | -      | [UniqueId](https://lodash.com/docs/#uniqueId)('smfillextrusionlayer-') |
| sourceId    | 图层源名称                                                | string                                                                                                                                             | -      | -                                 |
| layerStyle  | 图层样式                                                  | [FillStyle](/zh/api/common-types/common-types.md#fillstyle)                                                                                        | -      | -                                 |
| data        | 图层数据（支持传入 GeoJSON 数据）或者 MapboxGL Style 对象 | [GeoJSON FeatureCollection](https://tools.ietf.org/html/rfc7946#section-3.3) \| [MapboxGL.Style](https://docs.mapbox.com/mapbox-gl-js/style-spec/) | -      | -                                 |
| sourceLayer | 矢量瓦片数据源使用的图层                                  | string                                                                                                                                             | -      | -                                 |
| minzoom     | 图层的最小缩放级别                                        | number                                                                                                                                             | -      | 0                                 |
| maxzoom     | 图层的最大缩放级别                                        | number                                                                                                                                             | -      | 22                                |
| filter      | 指定图层源特性条件的表达式                                | [expression](https://www.mapbox.cn/mapbox-gl-js/style-spec/#expressions)                                                                           | -      | -                                 |
