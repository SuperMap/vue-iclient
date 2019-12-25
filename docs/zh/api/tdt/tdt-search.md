# POI 搜索

<!-- <sm-iframe src="https://iclient.supermap.io/examples/component/components_webmap_vue.html"></sm-iframe> -->

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-tdt-search position="top-left" :data="{tk:'1d109683f4d84198e37a38c442d68311'}"></sm-tdt-search>
</sm-web-map>
```

### Attributes

| 参数         | 说明                                                                            | 类型                    | 可选值                                                       | 默认值                                                   |
| :----------- | :------------------------------------------------------------------------------ | :---------------------- | :----------------------------------------------------------- | :------------------------------------------------------- |
| collapsed    | 是否折叠                                                                        | boolean                 | -                                                            | false                                                    |
| position     | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                                               |
| mode         | 搜索框样式                                                                      | string                  | 'control' \| 'toolBar'                                       | 'control'                                                |
| resultRender | 查询结果后的回调方法                                                            | function(searchResults) | -                                                            | -                                                        |
| data         | 天地图搜索服务和许可服务配置                                                    | object                  | -                                                            | {searchUrl: 'http://api.tianditu.gov.cn/search', tk: ''} |
