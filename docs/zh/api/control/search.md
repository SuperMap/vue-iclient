# POI 搜索

POI 搜索组件，搜索源支持 SuperMap online 本地搜索服务、SuperMap iServer 地图服务、SuperMap iServer 数据服务、SuperMap iServer 地址匹配服务、SuperMap iPortal 资源中心数据、地图矢量叠加图层。

<sm-iframe src="http://iclient.supermap.io/dev/examples/component/components_search_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
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

| 参数                 | 说明                                                                            | 类型                                                                                 | 可选值                                                       | 默认值                           |
| :------------------- | :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------- |
| layerNames           | 图层名搜索配置（图层需为矢量图层）                                                  | string[ ]                                                                            | -                                                            | -                                |
| onlineLocalSearch    | SuperMap online 本地搜索服务配置                                            | Object                                                                               | -                                                            | { enable: true, city: '北京市' } |
| restData             | SuperMap iServer 数据服务搜索配置                                               | [RestDataParameter](/zh/api/common-types/common-types.md#restdataparameter)[ ]       | -                                                            | -                                |
| restMap              | SuperMap iServer 地图服务搜索配置                                               | [RestMapParameter](/zh/api/common-types/common-types.md#restmapparameter)[ ]         | -                                                            | -                                |
| iportalData          | SuperMap iPortal 资源中心数据搜索配置                                           | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter)[ ] | -                                                            | -                                |
| addressMatch         | SuperMap iServer 地址匹配服务地址                                               | string[ ]                                                                            | -                                                            | -                                |
| maxFeatures          | 要素最大返回数                                                                  | number                                                                               | -                                                            | 8                                |
| mode                 | 搜索框样式                                                                      | string                                                                               | 'control' \| 'toolBar'                                       | 'control'                        |
| openSearchSuggestion | 是否开启建议搜索                                                                | boolean                                                                              | -                                                            | false                            |
| alwaysCenter         | 搜索结果是否以点图层显示                                                        | boolean                                                                              | -                                                            | true                             |
| showTitle            | 是否显示搜索源名称                                                              | boolean                                                                              | -                                                            | true                             |
| showResult           | 是否显示下拉搜索结果                                                            | boolean                                                                              | -                                                            | true                             |
| resultRender         | 自定义渲染搜索结果回调函数                                                      | Function                                                                             | -                                                            | -                                |
| position             | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                                                               | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                       |
| collapsed            | 是否默认折叠                                                                    | boolean                                                                              | -                                                            | false                            |
