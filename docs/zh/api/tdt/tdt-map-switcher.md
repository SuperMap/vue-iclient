# 地图切换

<sm-iframe src="https://iclient.supermap.io/examples/component/components_tianditu_switch_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-tdt-map-switcher position="top-left" :data="{tk:1d109683f4d84198e37a38c442d68311}" :collapsed="false"></sm-tdt-map-switcher>
</sm-web-map>
```

### Attributes

| 参数       | 说明                       | 类型   | 可选值 | 默认值                             |
| :--------- | :------------------------- | :----- | :----- | :--------------------------------- |
| data       | 地图切换配置               | object | -      | {select: '', label: false, tk: ''} |
| iconClass  | 收缩按钮的 Font class 类名 | string | -      | 'sm-components-icon-map-switch'    |
| headerName | 标题名                     | string | -      | '地图切换'                         |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
