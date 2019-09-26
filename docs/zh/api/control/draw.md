# 绘制

<!-- <sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_pan_vue.html"></sm-iframe> -->

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-draw position="top-left"></sm-draw>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                            | 类型                                                                                                                                                                                          | 可选值                                                       | 默认值                     |
| :--------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------- |
| iconClass  | 收缩按钮 Icon 类名                                                              | string                                                                                                                                                                                        | -                                                            | 'sm-components-icons-edit' |
| autoRotate | 是否自动旋转                                                                    | boolean                                                                                                                                                                                       | -                                                            | false                      |
| collapsed  | 是否折叠                                                                        | boolean                                                                                                                                                                                       | -                                                            | true                       |
| headerName | 标题名                                                                          | string                                                                                                                                                                                        | -                                                            | '绘制'                     |
| position   | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                                                                                                                                                                        | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | -                          |
| layerStyle | 绘制图层的样式                                                                  | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -                                                            | -                          |

### Events

| name         | 说明               | 回调参数  |
| :----------- | :----------------- | :-------- |
| draw-created | 绘制结束事件       | popupInfo |
| draw-removed | 删掉绘制的图层事件 | -         |
