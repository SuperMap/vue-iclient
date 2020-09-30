# 动效标记点图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_rotating_text_border_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-animate-marker-layer :features="features" type="rotatingTextBorder" text-field="NAME" :colors="['rgb(21, 209, 242)', 'rgba(21, 209, 242, 0.56)']" :width="150"></sm-animate-marker-layer>
</sm-web-map>
```

### Attributes

<<<<<<< HEAD
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
=======
| 参数         | 说明       | 类型              | 可选值                                                                                                | 默认值              |
| :----------- | :--------- | :---------------- | :---------------------------------------------------------------------------------------------------- | :------------------ |
| features     | 图层数据   | FeatureCollection。参考[OSCHINA](https://www.oschina.net/translate/geojson-spec?cmp) | -                                                                                                     | -                   |
| type         | 图层类型   | string            | 'rotatingAperture' \| 'haloRing' \| 'breathingAperture' \| 'diffusedAperture' \| 'rotatingTextBorder' \| 'fluorescence' | 'breathingAperture' |
| width        | 点宽度     | number            | -                                                                                                     | -                   |
| height       | 点高度     | number            | -                                                                                                     | -                   |
| colors       | 颜色       | [string, string]  | -                                                                                                     | -                   |
| textFontSize | 字体大小   | number            | -                                                                                                     | 14                  |
| textColor    | 字体颜色   | string            | -                                                                                                     | '#fff'                |
| textField    | 显示字段   | string            | -                                                                                                     | -                   |
| fitBounds    | 是否自适应 | boolean           | -                                                                                                     | false               |
>>>>>>> dev
