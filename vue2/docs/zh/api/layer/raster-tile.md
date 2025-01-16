# 栅格图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_raster_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal" map-id="1329428269">
  <sm-raster-tile-layer v-bind="rasteLayerOptions"></sm-raster-tile-layer>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                     | 类型                                                                                       | 可选值         | 默认值 |
| :---------- | :------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :------------- | :----- |
| tileSize    | 瓦片大小                                                 | [tileSize](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-raster-dem-tileSize)   | -              | 512    |
| mapUrl      | SuperMap iServer 地图服务地址                            | string                                                                                     | -              | -      |
| tiles       | 地图 url。若 mapUrl 和 tiles 都存在时，mapUrl 的优先级较大 | [tiles](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-raster-dem-tiles)         | -              | -      |
| bounds      | 图层显示范围                                             | [bounds](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-bounds)           | -              | -      |
| attribution | 版权信息                                                 | [attribution](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-attribution) | -              | -      |
| scheme      | 瓦片金字塔                                               | [scheme](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-scheme)           | 'xyz' \| 'tms' | 'xyz'  |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
