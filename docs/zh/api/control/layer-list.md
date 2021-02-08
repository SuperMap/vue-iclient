# 图层列表

<sm-iframe src="https://iclient.supermap.io/examples/component/components_layerList_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-layer-list position="top-left"></sm-layer-list>
</sm-web-map>
```

### Attributes

| 参数       | 说明                       | 类型   | 可选值 | 默认值                          |
| :--------- | :------------------------- | :----- | :----- | :------------------------------ |
| iconClass  | 收缩按钮的 Font class 类名 | string | -      | 'sm-components-icon-layer-list' |
| headerName | 标题名                     | string | -      | '图层'                          |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
