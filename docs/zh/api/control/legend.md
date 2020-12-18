# 图例

<sm-iframe src="https://iclient.supermap.io/examples/component/components_legend_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-legend :layer-names="['RANGE-民航数据CSV-0']" position="bottom-left"></sm-legend>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                                              | 类型     | 可选值                                                       | 默认值                            |
| :---------- | :-------------------------------------------------------------------------------- | :------- | :----------------------------------------------------------- | :-------------------------------- |
| layerNames  | 显示图例的图层                                                                    | string[] | -                                                            | -                                 |
| mode        | 图例样式                                                                          | string   | 'simple' \| 'panel'                                          | 'simple'                          |
| isShowTitle | 显示图层名                                                                        | boolean  | -                                                            | false                             |
| isShowField | 显示专题字段                                                                      | boolean  | -                                                            | false                             |
| position    | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效） | string   | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'bottom-right'                    |
| iconClass   | 收缩按钮 Icon 类名                                                                | string   | -                                                            | 'sm-components-icon-list' |
| headerName  | 标题名                                                                            | string   | -                                                            | '图例'                            |
| autoRotate  | 收缩按钮是否自动旋转                                                              | boolean  | -                                                            | false                             |
| collapsed   | 是否默认折叠（iconClass 参数存在时生效）                                          | boolean  | -                                                            | true                              |
