# 时间轴（点）

<sm-iframe src="https://iclient.supermap.io/examples/component/components_time_line_vue.html"></sm-iframe>

```vue
<sm-time-line :data="['2020-04-25 01:00:00', '2020-04-25 02:00:00', '2020-04-25 03:00:00']">
</sm-time-line>
```

### Attributes

| 参数            | 说明                                                                                                             | 类型            | 可选值 | 默认值 |
| :-------------- | :--------------------------------------------------------------------------------------------------------------- | :-------------- | :----- | :----- |
| data            | 时间轴节点数组，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.data)              | array           | -      | -      |
| autoPlay        | 是否自动播放                                                                                                     | boolean         | -      | false  |
| nextEnable      | 是否播放下一个点                                                                                                 | boolean | -      | -      |
| loop            | 是否循环播放                                                                                                     | boolean         | -      | true   |
| playInterval    | 播放间隔，单位毫秒（ms）                                                                                         | string          | -      | 3000   |
| currentIndex    | 当前选中项是哪项                                                                                                 | number          | -      | 0      |
| lineStyle       | 轴线样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.lineStyle)               | object          | -      | -      |
| label           | 轴的文本标签，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.label)               | object          | -      | -      |
| itemStyle       | 图形样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.itemStyle)               | object          | -      | -      |
| emphasis        | 高亮样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.emphasis)                | object          | -      | -      |
| checkpointStyle | 当前项的图形样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.checkpointStyle) | object          | -      | -      |
| controlStyle    | 控制按钮样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#timeline.controlStyle)        | object          | -      | -      |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)

### Events

| name                | 说明                         | 回调参数              | 参数说明                                                                                  |
| :------------------ | :--------------------------- | :-------------------- | :---------------------------------------------------------------------------------------- |
| timelinechanged     | 时间轴中的时间点改变后的事件 | function({type,currentIndex}) | 具体参考[echarts 文档](https://echarts.apache.org/zh/api.html#events.timelinechanged)     |
| timelineplaychanged | 时间轴中播放状态的切换事件   | function({type,playState})    | 具体参考[echarts 文档](https://echarts.apache.org/zh/api.html#events.timelineplaychanged) |
