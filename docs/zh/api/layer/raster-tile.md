# 栅格图层

<sm-iframe src="http://iclient.supermap.io/dev/examples/component/components_raster_vue.html"></sm-iframe>

```html
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="676816598">
  <sm-raster-tile-layer v-bind="rasteLayerOptions"></sm-raster-tile-layer>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                   | 类型                                                                                       | 可选值         | 默认值 |
| :---------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------- | :------------- | :----- |
| tileSize    | 瓦片大小                                               | [tileSize](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-raster-dem-tileSize)   | -              | 512    |
| mapUrl      | iServer 地图服务地址（mapUrl 参数与 tiles 参数二选一） | string                                                                                     | -              | -      |
| tiles       | 地图 url（mapUrl 参数与 tiles 参数二选一）             | [tiles](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-raster-dem-tiles)         | -              | -      |
| bounds      | 图层显示范围                                           | [bounds](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-bounds)           | -              | -      |
| attribution | 版权信息                                               | [attribution](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-attribution) | -              | -      |
| scheme      | 瓦片金字塔                                                     | [scheme](https://docs.mapbox.com/mapbox-gl-js/style-spec/#sources-vector-scheme)           | 'xyz' \| 'tms' | 'xyz'  |
| visible     | 地图是否可见                                           | boolean                                                                                    | -              | true   |
| opacity     | 地图透明度                                             | number                                                                                     | -              | 1      |
