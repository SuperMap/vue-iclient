# 视频+ 组件

```vue
<sm-video-plus
  url="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  video-width="1920"
  video-height="1080"
></sm-video-plus>
```

### Attributes

| 参数        | 说明                 | 类型    | 可选值 | 默认值 |
| :---------- | :------------------- | :------ | :----- | :----- |
| target      | 视频容器 ID          | string  | -      | video  |
| url         | 视频地址             | string  | 视频后缀可为 mp4、m3u8、flv      | -      |
| autoplay    | 是否自动播放       | boolean | -      | false  |
| loop        | 是否循环播放         | boolean | -      | false  |
| play        | 是否播放 | boolean | -      | false  |
| videoWidth  | 视频宽度             | number  | -      | -      |
| videoHeight | 视频高度             | number  | -      | -      |

### Events

| name       | 说明                   | 回调参数       |
| :--------- | :--------------------- | :------------- |
| load       | 视频+ 加载完成时触发 | function({ videoPlus }) |
| draw-created | 绘制完成 | function(option) |
| draw-removed | 删掉绘制 | function(option) |

> 其余事件请参照 [Mapboxgl.Events](https://docs.mapbox.com/mapbox-gl-js/api/map/#map-events)