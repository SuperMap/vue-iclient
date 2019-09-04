# 动效标记点图层

<sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_rotating_text_border_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-animate-marker-layer :features="features" type="rotatingTextBorder" text-field="NAME" :colors="['rgb(21, 209, 242)', 'rgba(21, 209, 242, 0.56)']" :width="150"></sm-animate-marker-layer>
</sm-web-map>
```

### Attributes

| 参数         | 说明       | 类型              | 可选值                                                                          | 默认值            |
| :----------- | :--------- | :---------------- | :------------------------------------------------------------------------------ | :---------------- |
| features     | 图层数据   | FeatureCollection | -                                                                               | -                 |
| type         | 图层类型   | string            | rotatingAperture/haloRing/breathingAperture/diffusedAperture/rotatingTextBorder | breathingAperture |
| width        | 点宽度     | number            | -                                                                               | -                 |
| height       | 点高度     | number            | -                                                                               | -                 |
| colors       | 颜色       | [string, string]  | -                                                                               | -                 |
| textFontSize | 字体大小   | number            | -                                                                               | 14                |
| textColor    | 字体颜色   | string            | -                                                                               | #fff              |
| textField    | 显示字段   | string            | -                                                                               | -                 |
| fitBounds    | 是否自适应 | boolean           | -                                                                               | false             |
