# 属性表

```vue
<sm-attributes layerName="全国671个气象站观测数据">
</sm-attributes>
```

### Attributes

| 参数             | 说明                                                                                                  | 类型                                                                                                                                                                                                                                                | 可选值 | 默认值 |
| :--------------- | :---------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| layerName        | 图层名                                                                                                | string                                                                                                                                                                                                                                              | -      | -      |
| title            | 属性表标题                                                                                                | string                                                                                                                                                                                                                                              | -      | -      |
| dataset          | 数据来源                                                                                              | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter) \| [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter) \| [GeoJSONParameter](/zh/api/common-types/common-types.md#geojsonparameter) | -      | -      |
| associateWithMap | 关联地图的配置。<a href="#associatewithmap">配置项</a>                                                | object                                                                                                                                                                                                                                              | -      | -      |
| statistics       | 统计配置。<a href="#statistics">配置项</a>                                                            | object                                                                                                                                                                                                                                              | -      | -      |
| toolbar          | 工具条配置。<a href="#toolbar">配置项</a>                                                             | object                                                                                                                                                                                                                                             | -      | -      |
| table            | 表格配置。<a href="#table">配置项</a>                                                                 | object                                                                                                                                                                                                                                              | -      | -      |
| fieldConfigs     | 列字段配置。<a href="#fieldconfigs">配置项</a>                                                        | object                                                                                                                                                                                                                                              | -      | -      |
| customHeaderRow     | 设置头部行属性。<a href="#customRowCell">使用</a>                                                  | Function(column, index)                                                                                                                                                                                                                                             | -      | -      |
| customRow          | 设置行属性。<a href="#customRowCell">使用</a>                                                       | Function(record, index)                                                                                                                                                                                                                                             | -      | -      |
| layerStyle       | 图层样式                                                                                              | [LayerStyle](/zh/api/common-types/common-types.md#layerStyle)                                                                                                                                                                                       | -      | -      |
| mapTarget        | 关联地图容器 ID。如果该参数省略，则默认绑定其父组件为地图组件的 Map 实例或者第一个地图组件的 Map 实例 | string                                                                                                                                                                                                                                              | -      | -      |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)

### associatewithmap

| 参数            | 说明               | 类型    | 可选值 | 默认值 |
| :-------------- | :----------------- | :------ | :----- | :----- |
| enable          | 是否关联地图       | boolean | -      | true   |
| zoomToFeature   | 是否缩放到选中要素 | boolean | -      | false  |
| centerToFeature | 是否居中选中要素   | boolean | -      | false  |

### table

| 参数       | 说明         | 类型              | 可选值 | 默认值 |
| :--------- | :----------- | :---------------- | :----- | :----- |
| showBorder | 是否显示边框 | boolean           | -      | true   |
| showHeader | 是否显示表头 | boolean           | -      | false  |
| pagination | 分页配置     | boolean \| object | -      | -      |

### statistics

| 参数       | 说明             | 类型    | 可选值 | 默认值 |
| :--------- | :--------------- | :------ | :----- | :----- |
| showTotal  | 是否显示总数     | boolean | -      | true   |
| showSelect | 是否显示选中数量 | boolean | -      | true   |

### fieldconfigs

| 参数             | 说明                                                  | 类型                       | 可选值                        | 默认值 |
| :--------------- | :--------------------------------------------------- | :------------------------- | :---------------------------- | :----- |
| title            | 列标题                                               | string                     | -                             | -      |
| value            | 列数据                                               | string                     | -                             | -      |
| visible          | 列数据是否显示                                       | boolean                     | -                             | -      |
| align            | 设置列内容的对齐方式                                 | string                      | 'left' \| 'right' \| 'center' | 'left' |
| filterMultiple   | 是否多选                                             | boolean                     | -                             | false  |
| width            | 列宽度                                               | string \| number            | -                             | -      |
| sorter           | 排序函数                                             | Function                    | -                             | -      |
| sortOrder        | 排序的受控属性，外界可用此控制列的排序                | boolean \| string           | -                             | -      |
| search           | 是否可搜索                                           | boolean                    | -                             | -      |
| customCell       | 设置单元格属性  <a href="#customRowCell">使用</a>    | Function(record, rowIndex)  | -                             | -      |
| customHeaderCell | 设置头部单元格属性 <a href="#customRowCell">使用</a> | Function(column)            | -                             | -      |
 
### toolbar

| 参数               | 说明                     | 类型    | 可选值 | 默认值 |
| :----------------- | :----------------------- | :------ | :----- | :----- |
| enable             | 是否开启工具条           | boolean | -      | true   |
| showRefresh        | 是否显示刷新数据选项     | boolean | -      | true   |
| showZoomToFeatur   | 是否显示缩放到要素选项   | boolean | -      | true   |
| showClearSelected  | 是否显示清除选中要素选项 | boolean | -      | true   |
| showColumnsControl | 是否显示列显示隐藏选项   | boolean | -      | true   |

### Events

| name      | 说明                       | 回调参数                                                       |
| :-------- | :------------------------- | :------------------------------------------------------------- |
| change    | 分页、排序、筛选变化时触发 | function({pagination, filters, sorter, { currentDataSource }}) | - |
| rowSelect | 被选中行的 key 数组        | function( changeableRowKeys )                                  |

### customRowCell
适用于 customRow customHeaderRow customCell customHeaderCell。遵循<a target="_blank" href="https://github.com/vuejs/babel-plugin-transform-vue-jsx">Vue jsx</a>语法。

```js
<sm-attributes
  customRow={(record) => {
    return 
      props: {
        xxx... //属性
      },
      on: { // 事件
        click: (event) => {},       // 点击行
        dblclick: (event) => {},
        contextmenu: (event) => {},
        mouseenter: (event) => {},  // 鼠标移入行
        mouseleave: (event) => {}
      },
    };
  )}
/>
```