---
pageClass: chart
---

# ECharts 图表

::: tip
该组件是基于 [vue-echarts](https://github.com/ecomfe/vue-echarts)
:::

<sm-iframe src="https://iclient.supermap.io/examples/component/components_chart_vue.html"></sm-iframe>

```vue
<sm-chart
  :colorGroup="['red', 'blue']"
  :options="echartOption"
  :dataset="dataset"
  :datasetOptions="datasetOptions"
  iconClass=""
></sm-chart>
```

### Attributes

| 参数             | 说明                                                                                                                                                                                                                                       | 类型                                                                                                                                                                                                                                                | 可选值 | 默认值                                                    |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :-------------------------------------------------------- |
| dataset          | 数据来源                                                                                                                                                                                                                                   | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter) \| [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter) \| [GeoJSONParameter](/zh/api/common-types/common-types.md#geojsonparameter) | -      | -                                                         |
| datasetOptions   | 数据来源的配置。<a href="#datasetoptions">配置项</a>                                                                                                                                                                                       | object                                                                                                                                                                                                                                              | -      | -                                                         |
| options          | ECharts 实例的数据。参照[echarts](https://echarts.apache.org/zh/option.html)                                                                                                                                                               | object                                                                                                                                                                                                                                              | -      | -                                                         |
| autoresize       | 用来指定 ECharts 实例在组件根元素尺寸变化时是否需要自动进行重绘                                                                                                                                                                            | boolean                                                                                                                                                                                                                                             | -      | true                                                      |
| theme            | 当前 ECharts 实例应用的主题。参照[echarts](https://echarts.apache.org/zh/api.html#echarts.init)                                                                                                                                            | string \| object                                                                                                                                                                                                                                    | -      | -                                                         |
| initOptions      | 初始化 ECharts 实例。参照[echarts](https://echarts.apache.org/zh/api.html#echarts.init)                                                                                                                                                    | object                                                                                                                                                                                                                                              | -      | -                                                         |
| group            | 实例的分组。会自动绑定到 ECharts 组件的同名属性上                                                                                                                                                                                          | string                                                                                                                                                                                                                                              | -      | -                                                         |
| manualUpdate     | 在性能敏感（数据量很大）的场景下，我们最好对于 options prop 绕过 Vue 的响应式系统。当将 manual-update prop 指定为 true 且不传入 options prop 时，数据将不会被监听。然后，你需要用 ref 获取组件实例以后手动调用 mergeOptions 方法来更新图表 | boolean                                                                                                                                                                                                                                             | -      | false                                                     |
| autoPlay         | 是否自动播放。图表类型为 pie 时生效                                                                                                                                                                                                        | boolean                                                                                                                                                                                                                                             | -      | false                                                     |
| associatedMap    | 是否与地图关联。点击图表项定位到地图，仅当有坐标的数据才能与地图联动。                                                                                                                                                                     | boolean                                                                                                                                                                                                                                             | -      | false                                                     |
| highlightOptions | 高亮 options                                                                                                                                                                                                                               | array                                                                                                                                                                                                                                               | -      | -                                                         |
| highlightColor   | 高亮颜色                                                                                                                                                                                                                                   | string                                                                                                                                                                                                                                              | -      | '#01ffff'                                                 |
| colorGroup       | 图表颜色                                                                                                                                                                                                                                   | string[ ]                                                                                                                                                                                                                                           | -      | [ '#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad' ] |
| iconClass        | 收缩按钮的 Font class 类名                                                                                                                                                                                                                 | string                                                                                                                                                                                                                                              | -      | 'sm-components-icon-chart'                                |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)和[定时刷新混入参数](/zh/api/mixin/mixin.md#timer)

### datasetOptions

| 参数       | 说明                                    | 类型    | 可选值                                                                                                           | 默认值 |
| :--------- | :-------------------------------------- | :------ | :--------------------------------------------------------------------------------------------------------------- | :----- |
| seriesType | 图表类型                                | string  | 'line' \| 'bar' \| 'scatter' \| 'pie' \| 'radar' \| 'gauge' \| '2.5Bar' <a href="#series">2.5Bar 新增字段</a> \| | -      |
| isStastic  | 是否统计数据                            | boolean | -                                                                                                                | false  |
| statisticFunction  | 统计数据的方式，包括最小值、最大值、求和、平均值、计数、众数、中位数、方差、标准差；也可以是一个自定义函数，接受两个参数，第一个参数为y轴待统计的字段值数组，第二个参数为待统计的要素数组     | string \| function |  'min' \| 'max' \| 'sum' \| 'mean' \| 'count' \| 'mode' \| 'median' \| 'variance' \| 'standardDeviation'\|function(fieldValues, features)                                                                                                                | 'sum'  |
| isStack    | 是否堆叠图表。仅 ( line, bar, scatter ) | boolean | -                                                                                                                | false  |
| xField     | x 轴数据字段                            | string  | -                                                                                                                | -      |
| yField     | y 轴数据字段                            | string  | -                                                                                                                | -      |

### series

::: tip
[与 echarts series 配置相同](https://github.com/ecomfe/vue-echarts), 新增配置如下：
:::
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :--------- | :-------------------------------------- | :------ | :---------------------------------------------------------- | :----- |
| shape | 图表形状 | string | 'square' \| 'rectangle' \| 'cylinder' | - |
