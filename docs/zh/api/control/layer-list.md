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
| attributesOptions | 属性表配置  <a href="#attributesOptions">配置项</a>       | object | -      |  -                             |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### attributesOptions

| 参数          | 说明                                                      | 类型              | 可选值                                                                                 | 默认值                                                               |
| :------------ | :-------------------------------------------------------- | :---------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| getContainer  | 指定属性表挂载的 HTML 节点                                 | function         | -                                                                                   | () => { return document.querySelector('.sm-component-web-map') }                                         |
| style         | 属性表样式                                                 | object           | -                                                                                   | -                                                                |
| iconClass     | 属性表开关按钮的 Font class 类名                           | string            | -                                                                                   | 'sm-components-icon-attribute'                                   |
| position      | 属性表的位置。（父级容器需设置样式: positions: absolute ）  | string            | 'bottom-left' \| 'top-left' \| 'bottom-right' \| 'top-right' \| 'top' \| 'bottom' \| 'left' \| 'right' \|       | 'bottom'            |
| props         | 属性表参数 <a href="#props">配置项</a>                     | object             | -                                                                                               | -                                                                |

### props

| 参数             | 说明                                                                         | 类型                                                   | 可选值 | 默认值 |
| :--------------- | :--------------------------------------------------------------------------- | :--------------------------------------------------- | :----- | :----- |
| associateWithMap | 关联地图的配置。[配置项](/zh/api/common/attributes.md#associatewithmap)     | object                                               | -      | -      |
| statistics       | 统计配置。[配置项](/zh/api/common/attributes.md#statistics)                 | object                                               | -      | -      |
| toolbar          | 工具条配置。[配置项](/zh/api/common/attributes.md#toolbar)                  | boolean                                              | -      | -      |
| table            | 表格配置。   [配置项](/zh/api/common/attributes.md#table)                   | object                                               | -      | -      |
| fieldConfigs     | 列字段配置。[配置项](/zh/api/common/attributes.md#fieldconfigs)             | object                                               | -      | -      |
| customHeaderRow  | 设置头部行属性。[使用](/zh/api/common/attributes.md#customRowCell)          | Function(column, index)                                               | -      | -      |
| customRow        | 设置行属性。[使用](/zh/api/common/attributes.md#customRowCell)               | Function(record, index)                                              | -      | -      |
| layerStyle       | 图层样式                                                                         | [LayerStyle](/zh/api/common-types/common-types.md#layerStyle)            | -      | -      |