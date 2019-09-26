---
pageClass: chart
---

# ECharts 图表

::: tip
该组件是基于 [vue-echarts](https://github.com/ecomfe/vue-echarts)
:::

<sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_chart_vue.html"></sm-iframe>

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

| 参数           | 说明                                                                                                                                                                                                                                       | 类型             | 可选值                                                       | 默认值                                                    |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- | :----------------------------------------------------------- | :-------------------------------------------------------- |
| iconClass      | 收缩按钮 Icon 类名                                                                                                                                                                                                                         | string           | -                                                            | 'sm-components-icons-attribute'                           |
| position       | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效                                                                                                                                                            | string           | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | -                                                         |
| dataset        | 数据来源，<a href="#dataset">配置项</a>                                                                                                                                                                                                    | object           | -                                                            | null                                                      |
| datasetOptions | 数据来源的配置，<a href="#datasetOptions">配置项</a>                                                                                                                                                                                       | object           | -                                                            | null                                                      |
| options        | ECharts 实例的数据。参照[echarts](https://echarts.apache.org/zh/option.html)                                                                                                                                                               | object           | -                                                            | {}                                                        |
| colorGroup     | 图表颜色                                                                                                                                                                                                                                   | string[]         | -                                                            | [ '#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad' ] |
| autoresize     | 用来指定 ECharts 实例在组件根元素尺寸变化时是否需要自动进行重绘                                                                                                                                                                            | boolean          | -                                                            | true                                                      |
| theme          | 当前 ECharts 实例应用的主题。参照[echarts](https://echarts.apache.org/zh/api.html#echarts.init)                                                                                                                                            | string \| object | -                                                            | -                                                         |
| initOptions    | 初始化 ECharts 实例。参照[echarts](https://echarts.apache.org/zh/api.html#echarts.init)                                                                                                                                                    | object           | -                                                            | -                                                         |
| group          | 实例的分组，会自动绑定到 ECharts 组件的同名属性上                                                                                                                                                                                          | string           | -                                                            | -                                                         |
| manualUpdate   | 在性能敏感（数据量很大）的场景下，我们最好对于 options prop 绕过 Vue 的响应式系统。当将 manual-update prop 指定为 true 且不传入 options prop 时，数据将不会被监听。然后，你需要用 ref 获取组件实例以后手动调用 mergeOptions 方法来更新图表 | boolean          | -                                                            | false                                                     |
| autoPlay       | 是否自动播放。图表类型为 pie 时生效                                                                                                                                                                                                        | boolean          | -                                                            | false                                                     |

### dataset

| 参数            | 说明                  | 类型                                                                          | 可选值                 | 默认值    |
| :-------------- | :-------------------- | :---------------------------------------------------------------------------- | :--------------------- | :-------- |
| type            | 服务类型              | string                                                                        | 'iServer' \| 'iPortal' | 'iServer' |
| url             | 服务地址              | string                                                                        | -                      | -         |
| withCredentials | 设置请求是否带 cookie | boolean                                                                       | -                      | false     |
| queryInfo       | 查询条件              | [SuperMap.FilterParameter](http://iclient.supermap.io/web/apis/mapboxgl.html) | -                      | -         |

### datasetOptions

| 参数       | 说明                                    | 类型    | 可选值                                                      | 默认值 |
| :--------- | :-------------------------------------- | :------ | :---------------------------------------------------------- | :----- |
| seriesType | 图表类型                                | string  | 'line' \| 'bar' \| 'scatter' \| 'pie' \| 'radar' \| 'gauge' | -      |
| isStastic  | 是否统计数据                            | boolean | -                                                           | false  |
| isStack    | 图表是否堆叠，仅 ( line, bar, scatter ) | boolean | -                                                           | false  |
| xField     | 数据的字段，坐标值                      | string  | -                                                           | -      |
| yField     | 数据的字段，数据值                      | string  | -                                                           | -      |
