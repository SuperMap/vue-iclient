# 平移

<sm-iframe src="https://iclient.supermap.io/examples/component/components_pan_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-pan position="top-left"></sm-pan>
</sm-web-map>
```

### Attributes

| 参数      | 说明                 | 类型   | 可选值 | 默认值 |
| :-------- | :------------------- | :----- | :----- | :----- |
| panLength | 平移步长。单位为像素 | number | -      | 200    |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
