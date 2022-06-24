# 时间轴（条）

<sm-iframe src="https://iclient.supermap.io/examples/component/components_timeline_tracklayer.html"></sm-iframe>

```vue
<sm-time-slider :duration="6000">
</sm-time-slider>
```

### Attributes

| 参数            | 说明                                                                                                                                                  | 类型          | 可选值 | 默认值 |
| :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :----- | :----- |
| data            | 时间轴节点数组([unix timestamp](https://baike.baidu.com/item/unix%E6%97%B6%E9%97%B4%E6%88%B3/2078227)数组)；同时传入 duration，优先级 duration > data | array         | -      | -      |
| duration        | 时间轴总时长 ，单位毫秒（ms）；同时传入 data，优先级 duration > data                                                                                  | number        | -      | -      |
| autoPlay        | 是否自动播放                                                                                                                                          | boolean       | -      | false  |
| loop            | 是否循环播放                                                                                                                                          | boolean       | -      | true   |
| playInterval    | 播放间隔，单位毫秒（ms）                                                                                                                              | number        | -      | 1000   |
| lineStyle       | 轴线样式                                                                                                                                              | object        | -      | -      |
| label           | 轴的文本标签                                                                                                                                          | object        | -      | -      |
| themeStyle      | 组件的样式， 例如 fontSize 和 color                                                                                                                   | CSSProperties | -      | -      |
| checkpointStyle | 滑块的样式，包含 color, border-color 属性                                                                                                             | object        | -      | -      |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)

### Events

| name                  | 说明               | 回调参数                                                                      | 参数说明                                                                                                              |
| :-------------------- | :----------------- | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| timeplayerchanged     | 时间点改变后的事件 | function({ currentTimeStamp, lastIndex, nextIndex }) \| ({ currentDuration }) | 如果 props 传入 data， 则返回{ currentTimeStamp, lastIndex, nextIndex }；如果传入 duration，则返回{ currentDuration } |
| timeplayerplaychanged | 播放状态的切换事件 | function(playState)                                                           | 当前播放状态                                                                                                          |
