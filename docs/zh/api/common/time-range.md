# 时间轴（段）

```vue
<sm-time-range :data="['2020-04-25 01:00:00', '2020-04-25 02:00:00', '2020-04-25 03:00:00']">
</sm-time-range>
```

### Attributes

| 参数            | 说明                                                                                                              | 类型             | 可选值 | 默认值                  |
| :-------------- | :---------------------------------------------------------------------------------------------------------------- | :--------------- | :----- | :---------------------- |
| startValue      | 数据窗口范围的起始数值                                                                                            | string \| number | -      | 0                       |
| endValue        | 数据窗口范围的结束数值                                                                                            | string \| number | -      | 1                       |
| backgroundColor | 组件的背景颜色                                                                                                    | string           | -      | 'rgba(47,69,84,0)'      |
| borderColor     | 边框颜色                                                                                                          | string           | -      | '#ddd'                  |
| fillerColor     | 选中范围的填充颜色                                                                                                | string           | -      | 'rgba(167,183,204,0.4)' |
| textStyle       | 字体样式，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#dataZoom-slider.textStyle)         | object           | -      | { color: '#ccc' }       |
| handleStyle     | 手柄的样式配置，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#dataZoom-slider.handleStyle) | object           | -      | -                       |
| data            | 类目数据，具体属性参考[echarts 文档](https://echarts.apache.org/zh/option.html#xAxis.data)                        | array            | -      | []                      |
