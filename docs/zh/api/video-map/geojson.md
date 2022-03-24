# GeoJSON 图层

```vue
<sm-video-map 
  address="https://www.runoob.com/try/demo_source/mov_bbb.mp4" 
  video-width="1920" 
  video-height="1080" >
  <sm-video-map-geojson-layer :layer-style="layerStyle" :data="data">
  </sm-video-map-geojson-layer>
</sm-video-map>
```

### Attributes

| 参数       | 说明                                                         | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :--------- | :----------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| data       | 图层数据（支持传入 GeoJSON 数据或可访问 GeoJSON 资源的 url） | [GeoJSON](https://geojson.org/) \| string                                                                                                                                                     | -      | -      |
| layerStyle | 图层样式                                                     | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -      | -      |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
