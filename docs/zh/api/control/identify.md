# 点选查询

<sm-iframe src="https://iclient.supermap.io/examples/component/components_identify_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-identify :layers="['民航数']"></sm-identify>
</sm-web-map>
```

### Attributes

| 参数           | 说明                                                                   | 类型                                                          | 可选值 | 默认值 |
| :------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------ | :----- | :----- |
| layers         | 查询的图层 Id                                                          | string[ ]                                                     | -      | -      |
| fields         | 弹窗内容显示的字段名。默认显示图层的所有字段                           | array[ ]                                                      | -      | -      |
| clickTolerance | 点击位置的检测容限。以像素为单位，将获取点击位置为圆心，检测容限为半径范围内的要素 | number                                                        | 5      | -      |
| layerStyle     | 高亮要素样式                                                           | [LayerStyle](/zh/api/common-types/common-types.md#layerstyle) | -      | -      |
| autoResize     | 自适应宽度                                                             | boolean                                                       | -      | true   |
| keyMaxWidth    | 键列的最大宽度                                                         | number                                                        | -      | 110    |
| valueMaxWidth  | 值列的最大宽度                                                         | number                                                        | -      | 170    |
| keyWidth       | 键列的宽度                                                             | number                                                        | -      | 110    |
| valueWidth     | 值列的宽度                                                             | number                                                        | -      | 170    |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)
