# 数据查询

数据查询组件，支持从 SuperMap iServer 地图服务，SuperMap iServer 数据服务，SuperMap iPortal 资源中心数据（该数据需要发布成服务）中查询数据。

<sm-iframe src="https://iclient.supermap.io/examples/component/components_query_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-query :rest-data="restData" :rest-map="restMap" :collapsed="false"></sm-query>
</sm-web-map>
```

### Attributes

| 参数        | 说明                                                                            | 类型                                                                                 | 可选值                                                       | 默认值                           |
| :---------- | :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------- |
| restData    | SuperMap iServer 数据服务查询配置                                               | [RestDataParameter](/zh/api/common-types/common-types.md#restdataparameter)[ ]       | -                                                            | -                                |
| restMap     | SuperMap iServer 地图服务查询配置                                               | [RestMapParameter](/zh/api/common-types/common-types.md#restmapparameter)[ ]         | -                                                            | -                                |
| iportalData | SuperMap iPortal 资源中心数据（该数据需要发布成服务）                           | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter)[ ] | -                                                            | -                                |
| position    | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                                                               | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                       |
| iconClass   | 收缩按钮 Icon 类名                                                              | string                                                                               | -                                                            | 'sm-components-icon-search-list' |
| headerName  | 标题名                                                                          | string                                                                               | -                                                            | '查询'                           |
| autoRotate  | 收缩按钮是否自动旋转                                                            | boolean                                                                              | -                                                            | false                            |
| collapsed   | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean                                                                              | -                                                            | true                             |
