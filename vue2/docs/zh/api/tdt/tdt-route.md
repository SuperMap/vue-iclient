# 路线查询

<sm-iframe src="https://iclient.supermap.io/examples/component/components_tianditu_route_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-tdt-route position="top-left" :data="{tk:'1d109683f4d84198e37a38c442d68311'}"></sm-tdt-route>
</sm-web-map>
```

### Attributes

| 参数       | 说明                             | 类型   | 可选值 | 默认值                                                                                                                                                |
| :--------- | :------------------------------- | :----- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| data       | 天地图路线规划服务和许可服务配置 | object | -      | {carUrl: 'https://api.tianditu.gov.cn/drive', busUrl: 'https://api.tianditu.gov.cn/transit', searchUrl: 'https://api.tianditu.gov.cn/search', tk: ''} |
| iconClass  | 收缩按钮的 Font class 类名       | string | -      | 'sm-components-icon-road'                                                                                                                             |
| headerName | 标题名                           | string | -      | '路线'                                                                                                                                                |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
