# 属性表

```vue
<sm-feature-table layerName="全国671个气象站观测数据">
</sm-feature-table>
```

### Attributes

| 参数             | 说明                                                   | 类型                                                                                                                                                                                                                                                | 可选值 | 默认值 |
| :--------------- | :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| layerName        | 图层名                                                 | string                                                                                                                                                                                                                                              | -      | -      |
| dataset          | 数据来源                                               | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter) \| [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter) \| [GeoJSONParameter](/zh/api/common-types/common-types.md#geojsonparameter) | -      | -      |
| associateWithMap | 关联地图的配置。<a href="#associatewithmap">配置项</a> | object                                                                                                                                                                                                                                              | -      | -      |
| statistics       | 统计配置。<a href="#statistics">配置项</a>             | object                                                                                                                                                                                                                                              | -      | -      |
| toolbar          | 工具条的配置。<a href="#toolbar">配置项</a>            | boolean                                                                                                                                                                                                                                             | -      | -      |
| table            | 表格的配置。<a href="#table">配置项</a>                | object                                                                                                                                                                                                                                              | -      | -      |
| fieldConfigs     | 列字段配置。<a href="#fieldconfigs">配置项</a>         | object                                                                                                                                                                                                                                              | -      | -      |
| layerStyle       | 图层样式                                               | [LayerStyle](/zh/api/common-types/common-types.md#layerStyle)                                                                                                                                                                                       | -      | -      |
| mapTarget   | 关联地图容器 ID。如果该参数省略，则默认绑定其父组件为地图组件的 Map 实例或者第一个地图组件的 Map 实例 | string                                                                     | -      | -      |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)

### associatewithmap

| 参数            | 说明           | 类型    | 可选值 | 默认值 |
| :-------------- | :------------- | :------ | :----- | :----- |
| enable          | 关联地图       | boolean | -      | true   |
| zoomToFeature   | 选中缩放到要素 | boolean | -      | false  |
| centerToFeature | 选中居中要素   | boolean | -      | false  |

### table

| 参数       | 说明     | 类型              | 可选值 | 默认值 |
| :--------- | :------- | :---------------- | :----- | :----- |
| showBorder | 显示边框 | boolean           | -      | true   |
| showHeader | 显示表头 | boolean           | -      | false  |
| pagination | 分页配置 | boolean \| object | -      | -      |

### statistics

| 参数       | 说明       | 类型    | 可选值 | 默认值 |
| :--------- | :--------- | :------ | :----- | :----- |
| showTotal  | 显示总数   | boolean | -      | true   |
| showSelect | 显示选中数 | boolean | -      | true   |

### fieldconfigs

| 参数      | 说明                                   | 类型              | 可选值                        | 默认值 |
| :-------- | :------------------------------------- | :---------------- | :---------------------------- | :----- |
| title     | 列头显示文字                           | string            | -                             | -      |
| value     | 列数据在数据项中对应的 value           | string            | -                             | -      |
| align     | 设置列内容的对齐方式                   | string            | 'left' \| 'right' \| 'center' | 'left' |
| filtered  | 标识数据是否经过过滤，筛选图标会高亮   | boolean           | -                             | false  |
| width     | 列宽度                                 | string \| number  | -                             | -      |
| sorter    | 排序函数                               | Function          | -                             | -      |
| sortOrder | 排序的受控属性，外界可用此控制列的排序 | boolean \| string | -                             | -      |

### toolbar

| 参数               | 说明                 | 类型    | 可选值 | 默认值 |
| :----------------- | :------------------- | :------ | :----- | :----- |
| enable             | 开启工具条           | boolean | -      | true   |
| showRefresh        | 显示刷新数据         | boolean | -      | true   |
| showZoomToFeatur   | 显示缩放到要素选项   | boolean | -      | true   |
| showClearSelected  | 显示清除选中要素选项 | boolean | -      | true   |
| showColumnsControl | 显示列显示隐藏选项   | boolean | -      | true   |

### Events

| name      | 说明                       | 回调参数                                               | 参数说明 |
| :-------- | :------------------------- | :----------------------------------------------------- | :------- |
| change    | 分页、排序、筛选变化时触发 | ({pagination, filters, sorter, { currentDataSource }}) | -        |
| rowSelect | 被选中行的 key 数组        | ( changeableRowKeys )                                  | -        |
