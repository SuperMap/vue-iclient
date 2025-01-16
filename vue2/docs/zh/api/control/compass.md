# 指南针

<sm-iframe src="https://iclient.supermap.io/examples/component/components_compass_vue.html">
</sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-compass></sm-compass>
</sm-web-map>
```

### Attributes

| 参数           | 说明                                | 类型    | 可选值 | 默认值                    |
| :------------- | :---------------------------------- | :------ | :----- | :------------------------ |
| iconClass      | 按钮的 Font class 类名              | string  | -      | 'sm-components-icon-compass' |
| visualizePitch | 是否展示地图的倾角 | boolean | -      | false                     |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
