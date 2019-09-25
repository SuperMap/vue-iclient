# 比例尺

<sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_scale_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-scale position="top-left"></sm-scale>
</sm-web-map>
```

### Attributes

| 参数     | 说明                              | 类型   | 可选值                                      | 默认值   |
| :------- | :-------------------------------- | :----- | :------------------------------------------ | :------- |
| position     | 显示位置（添加成 control 时生效） | string   | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |
| unit     | 单位                              | string | 'imperial' \| 'metric' \| 'nautical'                    | 'metric'   |
| maxWidth | 最大宽度                          | number | -                                           | 100      |
