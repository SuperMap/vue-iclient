# 地图组件

<p style="font-size: 16px; color: #5e6d82; line-height: 1.5em;">
Web Map 地图组件。支持 MapboxGL Map，和对接 iPortal/Online 地图。<br>
目前支持地图坐标系包括：`'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'`。
</p>

## 加载 iPortal 地图

<sm-iframe src="https://iclient.supermap.io/examples/component/components_webmap_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284"></sm-web-map>
```

### Attributes

| 参数                  | 说明                                                            | 类型           | 可选值 | 默认值                    |
| :-------------------- | :-------------------------------------------------------------- | :------------- | :----- | :------------------------ |
| mapId                 | iPortal Online 地图 ID                                          | number \| string | -     | -                            |
| serverUrl             | SuperMap iPortal/Online 服务器地址                              | string         | -      | https://www.supermapol.com |
| accessToken           | 用于访问 SuperMap iPortal 、SuperMap Online 中受保护的服务      | string         | -      | -                         |
| accessKey             | SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制 | string         | -      | -                         |
| tiandituKey           | 用于访问天地图的服务                                            | string         | -      | -                         |
| withCredentials       | 请求是否携带 cookie                                             | boolean        | -      | false                     |
| excludePortalProxyUrl | server 传递过来的 URL 是否带有代理                              | boolean        | -      | false                     |
| autoresize            | 用来指定 webMap 实例在组件根元素尺寸变化时是否需要自动进行重绘  | boolean        | -      | true                      |

## 加载 iServer 地图

<sm-iframe src="https://iclient.supermap.io/examples/component/components_map_vue.html"></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions"></sm-web-map>
<script>
export default {
  data() {
      return {
        mapOptions: {
            container: 'map', // container id
            style: {
              "version": 8,
              "sources": {
                "raster-tiles": {
                  "type": "raster",
                  "tiles": [
                    'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
                  ],
                  "tileSize": 256
                }
              },
              "layers": [{
                "id": "simple-tiles",
                "type": "raster",
                "source": "raster-tiles",
                "minzoom": 0,
                "maxzoom": 22
              }]
            },
            center: [120.143, 30.236], // starting position
            zoom: 3 // starting zoom
          }
      };
}
</script>
```

### Attributes

| 参数       | 说明                                                                       | 类型    | 可选值 | 默认值 |
| :--------- | :------------------------------------------------------------------------- | :------ | :----- | :----- |
| mapOptions | [MapboxGL map options 对象](https://docs.mapbox.com/mapbox-gl-js/api/#map) | object  | -      | -      |
| autoresize | 用来指定 webMap 实例在组件根元素尺寸变化时是否需要自动进行重绘             | boolean | -      | true   |

<!-- ## 子组件

```vue
<sm-web-map
  server-url="https://iportal.supermap.io/iportal/"
  map-id="801571284"
  :layerList-control="{ show: true, position: 'top-left' }"
></sm-web-map>
```

### Attributes

| 参数             | 说明         | 类型   | 可选值 | 默认值 |
| :--------------- | :----------- | :----- | :----- | :----- |
| panControl       | 位移组件     | Object | -      | -      |
| scaleControl     | 比例尺组件   | Object | -      | -      |
| zoomControl      | 缩放组件     | Object | -      | -      |
| miniMapControl   | 鹰眼组件     | Object | -      | -      |
| layerListControl | 图层列表组件 | Object | -      | -      |
| measureControl   | 量算组件     | Object | -      | -      |
| legendControl    | 图例组件     | Object | -      | -      |

#### 子组件共用参数

::: tip
其它子组件参数请参照地图控件分类
:::

| 参数       | 说明     | 类型    | 可选值 | 默认值 |
| :--------- | :------- | :------ | :----- | :----- |
| show       | 是否显示 | boolean | -      | false  |
| position   | 显示位置 | boolean | -      | -      |
| background | 背景颜色 | string  | -      | -      |
| textColor  | 字体颜色 | string  | -      | -      | -->

### Events

| name | 说明             | 回调参数 |
| :--- | :--------------- | :------- |
| load | Map 加载完成事件 | -        |
