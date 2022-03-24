# 视频地图弹窗

```vue
<sm-video-map
  address="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  video-width="1920"
  video-height="1080"
>
  <sm-video-popup></sm-video-popup>
</sm-video-map>
```

### Attributes

| 参数        | 说明             | 类型             | 可选值                                                                                                                 | 默认值  |
| :---------- | :--------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------- | :------ |
| closeButton | 是否开启关闭按钮 | boolean          | -                                                                                                                      | true    |
| show        | 是否展开         | boolean          | -                                                                                                                      | true    |
| maxWidth    | 最大宽度         | string           | -                                                                                                                      | '240px' |
| coordinate  | 弹出框的坐标     | Array            | -                                                                                                                      | -       |
| offset      | 位置偏移         | number \| Object | -                                                                                                                      | -       |
| anchor      | 弹出框的方位     | string           | 'center' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-left' \| 'top-right' \| 'bottom-left' \| and 'bottom-right' | -       |

### Events

| name  | 说明               | 回调参数        |
| :---- | :----------------- | :-------------- |
| open  | 弹出框被打开时触发 | function(popup) |
| close | 弹出框被关闭时触发 | function(popup) |
