# 绘制

<sm-iframe src="https://iclient.supermap.io/examples/component/components_draw_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-draw :collapsed="false"></sm-draw>
</sm-web-map>
```

### Attributes

| 参数       | 说明                       | 类型                                                          | 可选值 | 默认值                    |
| :--------- | :------------------------- | :------------------------------------------------------------ | :----- | :------------------------ |
| layerStyle | 绘制图层的样式             | [LayerStyle](/zh/api/common-types/common-types.md#layerstyle) | -      | -                         |
| iconClass  | 收缩按钮的 Font class 类名 | string                                                        | -      | 'sm-components-icon-edit' |
| headerName | 标题名                     | string                                                        | -      | '绘制'                    |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### Events

| name         | 说明               | 回调参数                 |
| :----------- | :----------------- | :----------------------- |
| draw-created | 绘制完成事件       | function(option: object) |
| draw-removed | 删掉绘制的图层事件 | -                        |
