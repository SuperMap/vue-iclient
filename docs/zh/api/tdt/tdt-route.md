# 路线查询

<!-- <sm-iframe src="https://iclient.supermap.io/examples/component/components_webmap_vue.html"></sm-iframe> -->

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-tdt-route position="top-left" :data="{tk:'1d109683f4d84198e37a38c442d68311'}"></sm-tdt-route>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                            | 类型    | 可选值                                                       | 默认值                                                                                                                                                |
| :--------- | :------------------------------------------------------------------------------ | :------ | :----------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| iconClass  | 收缩按钮 Icon 类名                                                              | string  | -                                                            | 'sm-components-icon-road'                                                                                                                          |
| collapsed  | 是否折叠                                                                        | boolean | -                                                            | true                                                                                                                                                  |
| autoRotate | 是否自动旋转                                                                    | boolean | -                                                            | false                                                                                                                                                 |
| headerName | 标题名                                                                          | string  | -                                                            | '路线'                                                                                                                                                |
| position   | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                                                                                                                                            |
| data       | 天地图路线规划服务和许可服务配置                                                | object  | -                                                            | {carUrl: 'https://api.tianditu.gov.cn/drive', busUrl: 'https://api.tianditu.gov.cn/transit', searchUrl: 'https://api.tianditu.gov.cn/search', tk: ''} |
