# 视频+ 绘制

```vue
<sm-video-plus url="https://www.runoob.com/try/demo_source/mov_bbb.mp4" video-width="1920" video-height="1080">
  <sm-video-plus-draw></sm-video-plus-draw>
</sm-video-plus>
```

### Attributes

| 参数     | 说明                                                                                          | 类型   | 可选值                                                       | 默认值     |
| :------- | :-------------------------------------------------------------------------------------------- | :----- | :----------------------------------------------------------- | :--------- | --- |
| controls | 绘制菜单配置                                                                                  | Object      |     -                                                   | 'point' \| 'line_string' \| 'polygon' \| 'trash'          | -   |
| modes | 绘制模式 | string | - | 'direct_select' \| 'draw_line_string' \| 'draw_polygon' \| 'draw_point' |
| position | 控件添加到视频+ 上的位置 | string | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |
