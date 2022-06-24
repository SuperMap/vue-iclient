# 矢量瓦片图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_vector_tile_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal" map-id="1329428269">
  <sm-vector-tile-layer :style-options="styleOptions"></sm-vector-tile-layer>
</sm-web-map>
```

### Attributes

| 参数         | 说明                                        | 类型                                                                                                                                                 | 可选值 | 默认值 |
| :----------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| styleOptions | MapboxGL Style 对象或者 TileJSON 资源的 URL | [MapboxGL.Style](https://docs.mapbox.com/mapbox-gl-js/style-spec/) \| [tileUrl](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-url) | -      | -      |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
