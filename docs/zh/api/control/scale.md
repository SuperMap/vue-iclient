# 比例尺

<sm-iframe src="https://iclient.supermap.io/examples/component/components_scale_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-scale position="top-left"></sm-scale>
</sm-web-map>
```

### Attributes

| 参数     | 说明     | 类型   | 可选值                               | 默认值   |
| :------- | :------- | :----- | :----------------------------------- | :------- |
| unit     | 单位     | string | 'imperial' \| 'metric' \| 'nautical' | 'metric' |
| maxWidth | 最大宽度 | number | -                                    | 100      |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
