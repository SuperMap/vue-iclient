# 三维拉伸图层

```vue
<sm-web-map :map-options="mapOptions">
  <sm-fill-extrusion-layer :layer-style="layerStyle" :data="data"></sm-fill-extrusion-layer>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                      | 类型                                                                                                                                               | 可选值 | 默认值                            |
| :---------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :-------------------------------- |
| data        | 图层数据（支持传入 GeoJSON 数据）或者 MapboxGL Style 对象 | [GeoJSON FeatureCollection](https://tools.ietf.org/html/rfc7946#section-3.3) \| [MapboxGL.Style](https://docs.mapbox.com/mapbox-gl-js/style-spec/) | -      | -                                 |
| layerStyle  | 图层样式                                                  | [FillStyle](/zh/api/common-types/common-types.md#fillstyle)                                                                                        | -      | -                                 |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
