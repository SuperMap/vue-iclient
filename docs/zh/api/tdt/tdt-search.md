# POI 搜索

<sm-iframe src="https://iclient.supermap.io/examples/component/components_tianditu_search_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-tdt-search position="top-left" :data="{tk:'1d109683f4d84198e37a38c442d68311'}"></sm-tdt-search>
</sm-web-map>
```

### Attributes

| 参数         | 说明                                    | 类型                    | 可选值                 | 默认值                                                    |
| :----------- | :-------------------------------------- | :---------------------- | :--------------------- | :-------------------------------------------------------- |
| data         | 天地图搜索服务和许可服务配置            | object                  | -                      | {searchUrl: 'https://api.tianditu.gov.cn/search', tk: ''} |
| mode         | 设置 POI 搜索的模式为 Control 或 工具栏 | string                  | 'control' \| 'toolBar' | 'control'                                                 |
| resultRender | 查询结果后的回调方法                    | function(searchResults) | -                      | -                                                         |
| collapsed    | 是否默认折叠                            | boolean                 | -                      | false                                                     |
| splitLine    | 搜索框与查询结果的分割线                | boolean                 | -                      | true                                                     |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
