# 时间轴（段）

```vue
<sm-time-range :data="['2020-04-25 01:00:00', '2020-04-25 02:00:00', '2020-04-25 03:00:00']">
</sm-time-range>
```

### Attributes

| 参数            | 说明                                                                                                        | 类型             | 可选值 | 默认值                  |
| :-------------- | :---------------------------------------------------------------------------------------------------------- | :--------------- | :----- | :---------------------- |
| data            | 时间轴节点数组，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#xAxis.data)            | array            | -      | -                       |
| startValue      | 滑块起始数值                                                                                                | string \| number | -      | 0                       |
| endValue        | 滑块结束数值                                                                                                | string \| number | -      | 1                       |
| backgroundColor | 组件的背景颜色                                                                                              | string           | -      | 'rgba(47,69,84,0)'      |
| borderColor     | 边框颜色                                                                                                    | string           | -      | '#ddd'                  |
| fillerColor     | 选中范围的填充颜色                                                                                          | string           | -      | 'rgba(167,183,204,0.4)' |
| textStyle       | 字体样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#dataZoom-slider.textStyle)   | object           | -      | { color: '#ccc' }       |
| handleStyle     | 手柄样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#dataZoom-slider.handleStyle) | object           | -      | { color: '#ccc' }       |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)

### Events

| name     | 说明                 | 回调参数                                   | 参数说明                                                                       |
| :------- | :------------------- | :----------------------------------------- | :----------------------------------------------------------------------------- |
| datazoom | 数据区域缩放后的事件 | ({type,start,end, startValue?, endValue?}) | 具体参考[echarts 文档](https://echarts.apache.org/zh/api.html#events.datazoom) |
