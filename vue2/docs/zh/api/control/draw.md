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
| defaultLayerStyle | 绘制图层的默认样式             | [LayerStyle](#layerstyle) | -      | -                         |
| iconClass  | 收缩按钮的 Font class 类名 | string                                                        | -      | 'sm-components-icon-edit' |
| headerName | 标题名                     | string                                                        | -      | '绘制'                    |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### LayerStyle

```js
const layerStyle = {
  // 绘制结束后的样式
  'line-static': {
    'line-color': '#f75564',
    'line-width': 3
  },
  // 绘制结束后的 hover 样式
  'line-hover': {
    'line-color': '#f75564',
    'line-width': 33,
    'line-opacity': 0.2
  },
  // 正在绘制的样式
  'line-drawing': {
    'line-color': '#f75564',
    'line-dasharray': [0.4, 2],
    'line-width': 3
  },
  // 绘制结束后的样式
  'fill-static': {
    'fill-color': '#f75564',
    'fill-outline-color': '#f75564',
    'fill-opacity': 0.4
  },
  // 正在绘制的样式
  'fill-drawing': {
    'fill-color': '#f75564',
    'fill-outline-color': '#f75564',
    'fill-opacity': 0.6
  },
  // 正在绘制（或选中）线或面的顶点样式
  'vertex-static': {
    'circle-radius': 4,
    'circle-color': '#f75564'
  },
  // 正在绘制（或选中）线或面的顶点 stroke 样式
  'vertex-halo-static': {
    'circle-radius': 6,
    'circle-color': '#fff'
  },
  // 绘制结束后的样式
  'circle-static': {
    'circle-radius': 6,
    'circle-color': '#f75564'
  },
  // 正在绘制的样式
  'circle-drawing': {
    'circle-radius': 4,
    'circle-color': '#fff'
  },
  // 正在绘制的 stroke 样式
  'circle-halo-drawing': {
    'circle-radius': 6,
    'circle-color': '#f75564'
  }
};
```

图层样式

| 参数               | 说明                                                 | 类型                                                                    | 可选值 | 默认值 |
| :----------------- | :--------------------------------------------------- | :---------------------------------------------------------------------- | :----- | :----- |
| line-static        | 绘制结束后的线样式。MapboxGL 线图层样式配置          | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)   | -      | -      |
| line-hover         | 已绘制线的 hover 样式。MapboxGL 线图层样式配置       | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)   | -      | -      |
| line-drawing       | 正在绘制的线样式。MapboxGL 线图层样式配置            | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line)   | -      | -      |
| fill-static        | 绘制结束后的面样式。MapboxGL 面图层样式配置          | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#fill)   | -      | -      |
| fill-drawing       | 正在绘制的面样式。MapboxGL 面图层样式配置            | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#fill)   | -      | -      |
| vertex-static      | 选中线或面的顶点样式。MapboxGL 点图层样式配置        | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#circle) | -      | -      |
| vertex-halo-static | 选中线或面的顶点 stoke 样式。MapboxGL 点图层样式配置 | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#circle) | -      | -      |
| circle-static      | 绘制结束后的点样式。MapboxGL 点图层样式配置          | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#circle) | -      | -      |
| circle-drawing     | 正在绘制的点样式。MapboxGL 点图层样式配置            | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#circle) | -      | -      |
| circle-drawing     | 正在绘制的点 stroke 样式。MapboxGL 点图层样式配置    | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#circle) | -      | -      |

### Events

| name         | 说明               | 回调参数                 |
| :----------- | :----------------- | :----------------------- |
| draw-created | 绘制完成事件       | function(option: object) |
| draw-removed | 删掉绘制的图层事件 | -                        |
