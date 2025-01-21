# 鹰眼

<sm-iframe src="https://iclient.supermap.io/examples/component/components_minimap_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-mini-map position="top-left"></sm-mini-map>
</sm-web-map>
```

### Attributes

| 参数       | 说明                     | 类型    | 可选值 | 默认值                          |
| :--------- | :----------------------- | :------ | :----- | :------------------------------ |
| iconClass  | 收缩按钮的 Font class 类 | string  | -      | 'sm-components-icon-arrow-left' |
| autoRotate | 收缩按钮是否自动旋转     | boolean | -      | true                            |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[收缩卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
