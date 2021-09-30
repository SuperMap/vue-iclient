# 数据查询

数据查询组件，支持从 SuperMap iServer 地图服务，SuperMap iServer 数据服务，SuperMap iPortal 资源中心数据（该数据需要发布成服务）中查询数据。

<sm-iframe src="https://iclient.supermap.io/examples/component/components_query_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-query :rest-data="restData" :rest-map="restMap" :collapsed="false"></sm-query>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                  | 类型                                                                                 | 可选值 | 默认值                           |
| :---------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------- | :----- | :------------------------------- |
| restData    | SuperMap iServer 数据服务                     | [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter)[ ] | -      | -                                |
| restMap     | SuperMap iServer 地图服务                     | [iServerMapParameter](/zh/api/common-types/common-types.md#iservermapparameter)[ ]   | -      | -                                |
| iportalData | SuperMap iPortal 资源中心数据（该数据需要发布成服务） | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter)[ ] | -      | -                                |
| maxFeatures | 要素最大返回数                                        | number                                                                               | -      | 200                               |
| layerStyle  | 查询结果的图层样式                                    | [LayerStyle](/zh/api/common-types/common-types.md#layerstyle)                        | -      | -                                |
| iconClass   | 收缩按钮的 Font class 类名                            | string                                                                               | -      | 'sm-components-icon-search-list' |
| headerName  | 标题名                                                | string                                                                               | -      | '查询'                           |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
