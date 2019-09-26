# 路线查询

<!-- <sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_webmap_vue.html"></sm-iframe> -->

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-tdt-route position="top-left" :data="{tk:'1d109683f4d84198e37a38c442d68311'}"></sm-tdt-route>
</sm-web-map>
```

### Attributes

| 参数       | 说明                              | 类型    | 可选值                                      | 默认值   |
| :--------- | :-------------------------------- | :------ | :------------------------------------------ | :------- |
| collapsed  | 是否折叠                          | boolean | -                                           | true     |
| iconClass  | class 类名                        | string  | -                                                            | 'sm-components-icons-luxian'                                  |
| headerName | 标题名                            | string  | -                                           | '路线'     |
| position     | 显示位置（添加成 control 时生效） | string   | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |
| data | 天地图路线规划服务和许可服务配置 | object | - | {carUrl: 'https://api.tianditu.gov.cn/drive', busUrl: 'https://api.tianditu.gov.cn/transit', searchUrl: 'https://api.tianditu.gov.cn/search', tk: ''} |
