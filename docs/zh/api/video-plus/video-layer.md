# 视频+ 图层

```vue
<sm-video-plus url="https://www.runoob.com/try/demo_source/mov_bbb.mp4" video-width="1920" video-height="1080">
  <sm-video-plus-layer :layer-style="layerStyle" :data="data">
  </sm-video-plus-layer>
</sm-video-plus>
```

### Attributes

| 参数       | 说明                          | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :--------- | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| data       | 视频图层数据（ 类似 GeoJSON格式的数据，数据中坐标字段值为相对视频左上角的X, Y像素值） | [GeoJSON](https://geojson.org/) \| Object                                                                                                                                                     | -      | -      |
| layerStyle | 图层样式                      | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -      | -      |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
