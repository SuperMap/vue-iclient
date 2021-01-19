# 时间轴（条）

```vue
<sm-time-slider :duration="6000">
</sm-time-slider>
```

### Attributes

| 参数            | 说明                                                       | 类型    | 可选值 | 默认值 |
| :-------------- | :--------------------------------------------------------- | :------ | :----- | :----- |
| data            | timestamp（时间戳）的数组，单位秒（s）；与 duration 二选一 | array   | -      | []     |
| duration        | 时间轴，总时长 ，单位毫秒（ms）；与 data 二选一            | number  | -      | -      |
| autoPlay        | 是否自动播放                                               | boolean | -      | false  |
| loop            | 是否循环播放                                               | boolean | -      | true   |
| playInterval    | 播放的速度（跳动的间隔），单位毫秒（ms）                   | number  | -      | 1000   |
| lineStyle       | 轴线样式                                                   | object  | -      | { }    |
| label           | 轴的文本标签                                               | object  | -      | {}     |
| themeStyle      | 整个组件的样式， css 属性                                  | object  | -      | {}     |
| checkpointStyle | 滑块的样式，包含 color, border-color 属性                  | object  | -      | {}     |

### Events

| name                  | 说明               | 回调参数                                                              | 参数说明                                                                                        |
| :-------------------- | :----------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| timeplayerchanged     | 时间点改变后的事件 | ({ currentTimeStamp, lastIndex, nextIndex }) \| ({ currentDuration }) | 如果 porps 传入的是 data， 返回的是第一种情况；如果是传入的 duration，则返回{ currentDuration } |
| timeplayerplaychanged | 播放状态的切换事件 | (playState)                                                           | 当前播放状态                                                                                    |
