# 点选查询

<sm-iframe src="http://iclient.supermap.io/examples/component/components_identify_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-identify :layers="['民航数']"></sm-identify>
</sm-web-map>
```

### Attributes

| 参数           | 说明                                                                   | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| layers         | 点选查询的图层 id 的数组                                               | string[]                                                                                                                                                                                      | -      |
| fields         | 弹窗显示的属性，默认显示图层的所有字段                                 | string[]                                                                                                                                                                                      | -      |
| clickTolerance | 点击命中检测容限，以像素为单位。将获取点击位置周围指定像素半径内的要素 | number                                                                                                                                                                                        | 5      |
| layerStyle     | 高亮要素样式                                                           | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -      | -      |
