# 数据查询

数据查询组件，支持从 SuperMap iServer 地图服务，SuperMap iServer 数据服务，SuperMap iPortal 资源中心数据（该数据需要发布成服务）中查询数据。

<sm-iframe src="https://iclient.supermap.io/examples/component/components_query_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-query :rest-data="restData" :rest-map="restMap" :collapsed="false"></sm-query>
</sm-web-map>
```

### Attributes

| 参数           | 说明                                                                            | 类型                                                                                 | 可选值 | 默认值                           |
|:---------------|:------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------|:-------|:---------------------------------|
| showPopup      | 是否显示弹窗                                                                    | boolean                                                                              | -      | true                             |
| multiSelect    | 是否开启多选                                                                    | boolean                                                                              | -      | false                            |
| restData       | SuperMap iServer 数据服务                                                       | [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter)[ ] | -      | -                                |
| restMap        | SuperMap iServer 地图服务                                                       | [iServerMapParameter](/zh/api/common-types/common-types.md#iservermapparameter)[ ]   | -      | -                                |
| iportalData    | SuperMap iPortal 资源中心数据（该数据需要发布成服务）                             | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter)[ ] | -      | -                                |
| maxFeatures    | 要素最大返回数                                                                  | number                                                                               | -      | 200                              |
| layerStyle     | 查询结果的图层样式                                                              | [LayerStyle](/zh/api/common-types/common-types.md#layerstyle)                        | -      | -                                |
| highlightStyle | 选中查询结果的高亮图层样式                                                      | [LayerStyle](/zh/api/common-types/common-types.md#layerstyle)                        | -      | -                                |
| popupStyle     | 选中查询结果的弹窗样式                                                          | [PopupStyle](/zh/api/control/query.md#popupstyle)                                    | -      | -                                |
| iconClass      | 收缩按钮的 Font class 类名                                                      | string                                                                               | -      | 'sm-components-icon-search-list' |
| headerName     | 标题名                                                                          | string                                                                               | -      | '查询'                           |
| clickTolerance | 点击位置的检测容限。以像素为单位，将获取点击位置为圆心，检测容限为半径范围内的要素 | number                                                                               | -      | 5                                |


> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### PopupStyle

| 参数          | 说明           | 类型    | 可选值 | 默认值 |
|:--------------|:-------------|:--------|:-------|:-------|
| autoResize    | 自适应宽度     | boolean | -      | true   |
| keyMaxWidth   | 键列的最大宽度 | number  | -      | 160    |
| valueMaxWidth | 值列的最大宽度 | number  | -      | 300    |
| keyWidth      | 键列的宽度     | number  | -      | 80    |
| valueWidth    | 值列的宽度     | number  | -      | 150    |

> 选中查询结果的弹窗内容显示的是单个要素（[GeoJSON Feature](https://datatracker.ietf.org/doc/html/rfc7946#section-3.2)）的属性信息，以表格的形式展示，且只有两列。

### Events

| name            | 说明           | 回调参数    |
|:----------------|:-------------|:------------|
| query-succeeded | 查询成功后触发 | function(e) |
| query-failed    | 查询失败后触发 | function(e) |
