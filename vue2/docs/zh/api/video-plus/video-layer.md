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
| data       | 视频图层数据，类似 GeoJSON格式的数据，数据中坐标字段值为相对视频左上角的X, Y像素值 | [GeoJSON](https://geojson.org/) \| Object                                                                                                                                                     | -      | -      |
| layerStyle | 图层样式                      | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -      | -      |

### Events

| name  | 说明               | 回调参数        |
| :---- | :----------------- | :-------------- |
| click | 在图层上单击左键 | function(event) |
| mousedown | 在图层上按下鼠标 | function(evnet) |
| mouseup | 在图层上释放鼠标 | function(evnet) |
| dblclick | 在图层上鼠标双击左键 | function(evnet) |
| mousemove | 鼠标在图层上移动 | function(evnet) |
| mouseenter | 鼠标移入 | function(evnet) |
| mouseleave | 鼠标移出 | function(evnet) |
| mouseover | 鼠标移入图层 | function(evnet) |
| mouseout | 鼠标移出图层 | function(evnet) |
| contextmenu | 在图层上单击右键 | function(evnet) |

