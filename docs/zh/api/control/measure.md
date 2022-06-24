# 量算

<sm-iframe src="https://iclient.supermap.io/examples/component/components_measure_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-measure position="top-left"></sm-measure>
</sm-web-map>
```

### Attributes

| 参数                | 说明                                               | 类型    | 可选值 | 默认值                       |
| :------------------ | :------------------------------------------------- | :------ | :----- | :--------------------------- |
| showUnitSelect      | 是否显示单位选择框。若不显示，则显示对应的默认单位 | boolean | -      | true                         |
| distanceDefaultUnit | 默认长度单位                                       | string  | -      | 'kilometers'                 |
| areaDefaultUnit     | 默认面积单位                                       | string  | -      | 'kilometers'                 |
| continueDraw        | 是否开启多绘制                                     | boolean | -      | true                         |
| iconClass           | 收缩按钮的 Font class 类名                         | string  | -      | 'sm-components-icon-measure' |
| headerName          | 标题名                                             | string  | -      | '量算'                       |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
