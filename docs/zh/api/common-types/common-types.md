# 组件基础类型

组件基础类型，你可以通过以下方式快速创建一个类型对象，下面以 `CircleStyle` 为例：

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let CircleStyle = new VueiClient.commontypes.CircleStyle();
```

## CircleStyle

点样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [pain](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)    | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## LineStyle

线样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [pain](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)    | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## FillStyle

面样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [pain](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)    | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## HeatMapStyle

热力图样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [pain](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)    | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## RestMapParameter

| 参数            | 说明           | 类型   | 可选值 | 默认值                   |
| :-------------- | :------------- | :----- | :----- | :----------------------- |
| type            | 服务类型       | string | -      | 'iServer'                |
| url             | 服务地址       | string | -      | -                        |
| layerName       | 查询图层名     | string | -      | -                        |
| attributeFilter | 属性过滤条件   | string | -      | -                        |
| maxFeatures     | 要素最大返回数 | number | -      | 20                       |
| name            | 服务名称       | string | -      | 'SuperMap Rest 地图服务' |

## RestDataParameter

| 参数            | 说明           | 类型     | 可选值 | 默认值                   |
| :-------------- | :------------- | :------- | :----- | :----------------------- |
| type            | 服务类型       | string   | -      | 'iServer'                |
| url             | 服务地址       | string   | -      | -                        |
| dataName        | 查询数据集名   | string[] | -      | -                        |
| attributeFilter | 属性过滤条件   | string   | -      | -                        |
| maxFeatures     | 要素最大返回数 | number   | -      | 20                       |
| name            | 服务名称       | string   | -      | 'SuperMap Rest 数据服务' |

## iPortalDataParameter

| 参数            | 说明                | 类型    | 可选值 | 默认值                  |
| :-------------- | :------------------ | :------ | :----- | :---------------------- |
| type            | 服务类型            | string  | -      | 'iPortal'               |
| url             | 服务地址            | string  | -      | -                       |
| attributeFilter | 属性过滤条件        | string  | -      | -                       |
| maxFeatures     | 要素最大返回数      | number  | -      | 20                      |
| name            | 服务名称            | string  | -      | 'SuperMap iPortal 数据' |
| withCredentials | 请求是否携带 cookie | boolean | -      | false                   |

## GeoJSONParameter

| 参数            | 说明                | 类型                            | 可选值 | 默认值    |
| :-------------- | :------------------ | :------------------------------ | :----- | :-------- |
| type            | 服务类型            | string                          | -      | 'geoJSON' |
| geoJSON         | GeoJSON 数据        | [GeoJSON](https://geojson.org/) | -      | -         |
| attributeFilter | 属性过滤条件        | string                          | -      | -         |
| maxFeatures     | 要素最大返回数      | number                          | -      | 20        |
| withCredentials | 请求是否携带 cookie | boolean                         | -      | false     |
