# 缩放

<sm-iframe src="https://iclient.supermap.io/examples/component/components_zoom_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-zoom :show-zoom-slider="true"></sm-zoom>
</sm-web-map>
```

### Attributes

| 参数           | 说明             | 类型    | 可选值 | 默认值 |
| :------------- | :--------------- | :------ | :----- | :----- |
| showZoom       | 是否显示当前级别 | boolean | -      | false  |
| showZoomSlider | 是否显示滑动条   | boolean | -      | false  |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
