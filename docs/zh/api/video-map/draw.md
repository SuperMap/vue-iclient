# 视频地图绘制

```vue
<sm-video-map
  src="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  video-width="1920"
  video-height="1080"
>
  <sm-video-map-draw></sm-video-map-draw>
</sm-video-map>
```

### Attributes

| 参数     | 说明                                                                                          | 类型   | 可选值                                                       | 默认值     |
| :------- | :-------------------------------------------------------------------------------------------- | :----- | :----------------------------------------------------------- | :--------- |
| options  | 绘制配置                                                                                      | Object | -                                                            | -          |
| position | 控件添加到地图上的位置。添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |

### Events

| name         | 说明               | 回调参数                 |
| :----------- | :----------------- | :----------------------- |
| draw-created | 绘制完成事件       | function(option: object) |
| draw-removed | 删掉绘制的图层事件 | -                        |
