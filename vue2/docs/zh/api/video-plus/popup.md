# 视频+ 弹窗

```vue
<sm-video-plus
  address="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  video-width="1920"
  video-height="1080"
>
  <sm-video-plus-popup coordinate="[500,500]"></sm-video-plus-popup>
</sm-video-plus>
```

### Attributes

| 参数        | 说明             | 类型             | 可选值                                                                                                                 | 默认值  |
| :---------- | :--------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------- | :------ |
| coordinate  | 相对于视频左上角的 X,Y 像素值坐标     | Array            | - 
| content | 显示的内容 |    string | -   
| closeButton | 是否开启关闭按钮 | boolean          | -                                                                                                                      | true    |
| closeOnClick | 点击时关闭弹窗 | boolean          | -                                                                                                                      | true    |
| show        | 是否展开         | boolean          | -                                                                                                                      | true    |
| maxWidth    | 最大宽度         | string           | -                                                                                                                      | '240px' |
| offset      | 位置偏移         | number \| Object | -                                                                                                                      | -       |
| anchor      | 弹出框的方位     | string           | 'center' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-left' \| 'top-right' \| 'bottom-left' \| and 'bottom-right' | -       |
| className | 弹窗自定义类名 | string | - | -

### Events

| name  | 说明               | 回调参数        |
| :---- | :----------------- | :-------------- |
| open  | 弹出框被打开时触发 | function(Popup) |
| close | 弹出框被关闭时触发 | function(Popup) |
