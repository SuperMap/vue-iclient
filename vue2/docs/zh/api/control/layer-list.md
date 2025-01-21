# 图层列表

<sm-iframe src="https://iclient.supermap.io/examples/component/components_layerList_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-layer-list position="top-left"></sm-layer-list>
</sm-web-map>
```

### Attributes

| 参数              | 说明                                                      | 类型   | 可选值 | 默认值                          |
| :---------------- | :-------------------------------------------------------- | :----- | :----- | :------------------------------ |
| iconClass         | 收缩按钮的 Font class 类名                                 | string | -      | 'sm-components-icon-layer-list' |
| headerName        | 标题名                                                    | string | -      | '图层'                             |
| attributes        | 属性表配置  <a href="#attributes">配置项</a>       | object | -      |  -                             |
| operations   | 图层操作配置  <a href="#operations">配置项</a>       | object | -      |  -                             |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### attributes

| 参数             | 说明                                                                      | 类型              | 可选值                                                                                 | 默认值                                                               |
| :--------------- | :------------------------------------------------------------------------ | :---------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| enabled          | 打开显示属性表的开关按钮                                                   | boolean          | -                                                                                   | false                                                                |
| getContainer     | 指定属性表挂载的 HTML 节点                                                 | function         | -                                                                                   | () => { return document.querySelector('.sm-component-web-map') }                                         |
| style            | 属性表样式                                                                 | object           | -                                                                                   | -                                                                |
| position         | 属性表的位置。（父级容器需设置样式: positions: absolute ）                  | string                     | 'bottom-left' \| 'top-left' \| 'bottom-right' \| 'top-right' \| 'top' \| 'bottom' \| 'left' \| 'right' \|       | 'bottom'            |

> 更多配置项，请查看 [Attributes](/zh/api/common/attributes.md)（其中不支持layerName、dataset和mapTarget参数）。


### operations

| 参数             | 说明                                                                      | 类型              | 可选值                                                                                 | 默认值                                                               |
| :--------------- | :------------------------------------------------------------------------ | :---------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| fitBounds          | 是否开启缩放至图层功能  | boolean          | -      | true       |
| draggable            | 是否开启拖拽调整图层顺序功能  | boolean          | -      | false       |
| opacity              | 是否开启调整图层不透明度功能  | boolean          | -      | false       |
