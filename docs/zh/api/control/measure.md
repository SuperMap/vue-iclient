# 量算

<sm-iframe src="https://iclient.supermap.io/examples/component/components_measure_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-measure position="top-left"></sm-measure>
</sm-web-map>
```

### Attributes

| 参数                | 说明                                                                            | 类型    | 可选值                                                       | 默认值                        |
| :------------------ | :------------------------------------------------------------------------------ | :------ | :----------------------------------------------------------- | :---------------------------- |
| iconClass           | 收缩按钮 Icon 类名                                                              | string  | -                                                            | 'sm-components-icon-measure' |
| collapsed           | 是否折叠                                                                        | boolean | -                                                            | true                          |
| autoRotate          | 是否自动旋转                                                                    | boolean | -                                                            | true                          |
| headerName          | 标题名                                                                          | string  | -                                                            | '量算'                        |
| position            | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | -                             |
| showUnitSelect      | 配置单位选择框是否显示，若不显示，则显示对应的默认单位                          | boolean | -                                                            | true                          |
| distanceDefaultUnit | 距离默认单位                                                                    | string  | -                                                            | 'kilometers'                  |
| areaDefaultUnit     | 面积默认单位                                                                    | string  | -                                                            | 'kilometers'                  |
| continueDraw        | 是否开启多绘制                                                                  | boolean | -                                                            | true                          |
