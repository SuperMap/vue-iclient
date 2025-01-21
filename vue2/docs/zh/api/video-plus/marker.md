# 视频+ 标记

```vue
<sm-video-plus url="https://www.runoob.com/try/demo_source/mov_bbb.mp4" video-width="1920" video-height="1080">
  <sm-video-plus-marker coordinate="[500,500]"></sm-video-plus-marker>
</sm-video-plus>
```

### Attributes

| 参数        | 说明             | 类型             | 可选值                                                                                                                 | 默认值  |
| :---------- | :--------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------- | :------ |
| closeButton | 是否开启关闭按钮 | boolean          | -                                                                                                                      | true    |
| show        | 是否展开         | boolean          | -                                                                                                                      | true    |
| maxWidth    | 最大宽度         | string           | -                                                                                                                      | '240px' |
| coordinate  | 相对于视频左上角的 X,Y 像素值坐标     | Array            | -                                                                                                                      | -       |
| offset      | 位置偏移         | number \| Object  \| Array | -                                                                                                                      | -       |
| anchor      | 方位     | string           | 'center' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-left' \| 'top-right' \| 'bottom-left' \| and 'bottom-right' | -       |
| scale  | 比例     | Array            | -     
| rotation  | 旋转     | Array            | -     
| draggable  | 是否可拖拽     | boolean            | -   

### Events

| name  | 说明               | 回调参数        |
| :---- | :----------------- | :-------------- |
| drag  | 拖拽过程中触发 | function(Marker) |
| dragstart | 拖拽开始时触发 | function(Marker) |
| dragend | 拖拽结束时触发 | function(Marker) |
