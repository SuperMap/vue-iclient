# 比例尺

<sm-iframe src="https://iclient.supermap.io/examples/component/components_scale_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-scale position="top-left"></sm-scale>
</sm-web-map>
```

### Attributes

| 参数     | 说明                                                                            | 类型   | 可选值                                                       | 默认值     |
| :------- | :------------------------------------------------------------------------------ | :----- | :----------------------------------------------------------- | :--------- |
| position | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |
| unit     | 单位                                                                            | string | 'imperial' \| 'metric' \| 'nautical'                         | 'metric'   |
| maxWidth | 最大宽度                                                                        | number | -                                                            | 100        |
