# POI 搜索

POI 搜索组件，搜索源支持 SuperMap online 本地搜索服务、SuperMap iServer 地图服务、SuperMap iServer 数据服务、SuperMap iServer 地址匹配服务、SuperMap iPortal 资源中心数据、地图矢量叠加图层。

<sm-iframe src="https://iclient.supermap.io/examples/component/components_search_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-search
    position="top-left"
    :layer-names="layerNames"
    :address-match="addressMatch"
    :rest-map="restMap"
    :online-local-search="onlineLocalSearch"
  ></sm-search>
</sm-web-map>
```

### Attributes

| 参数                 | 说明                                    | 类型                                                                                 | 可选值                 | 默认值                           |
| :------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------- | :--------------------- | :------------------------------- |
| layerNames           | 图层名（图层需为矢量图层）              | string[ ]                                                                            | -                      | -                                |
| onlineLocalSearch    | SuperMap online 本地搜索服务            | Object                                                                               | -                      | { enable: true, city: '北京市' } |
| restData             | SuperMap iServer 数据服务               | [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter)[ ] | -                      | -                                |
| restMap              | SuperMap iServer 地图服务               | [iServerMapParameter](/zh/api/common-types/common-types.md#iservermapparameter)[ ]   | -                      | -                                |
| iportalData          | SuperMap iPortal 资源中心数据           | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter)[ ] | -                      | -                                |
| addressMatch         | SuperMap iServer 地址匹配服务地址       | string[ ]                                                                            | -                      | -                                |
| maxFeatures          | 要素最大返回数                          | number                                                                               | -                      | 8                                |
| mode                 | 设置 POI 搜索的模式为 Control 或 工具栏 | string                                                                               | 'control' \| 'toolBar' | 'control'                        |
| openSearchSuggestion | 是否开启建议搜索                        | boolean                                                                              | -                      | false                            |
| alwaysCenter         | 是否以点图层显示搜索结果                | boolean                                                                              | -                      | true                             |
| showTitle            | 是否显示搜索源名称                      | boolean                                                                              | -                      | true                             |
| showResult           | 是否显示下拉框搜索结果                  | boolean                                                                              | -                      | true                             |
| resultRender         | 自定义渲染搜索结果                      | Function                                                                             | -                      | -                                |
| collapsed            | 是否默认折叠                            | boolean                                                                              | -                      | false                            |
| splitLine            | 搜索框与查询结果的分割线                | boolean                                                                              | -                      | false                            |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
