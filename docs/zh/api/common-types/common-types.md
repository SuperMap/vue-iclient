# 组件基础类型

组件基础类型，你可以通过以下方式快速创建一个类型对象：

## LayerStyle

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let layerStyle = {
  circle: new VueiClient.commontypes.CircleStyle(
    {
      'circle-radius': 6,
      'circle-color': '#3fb1e3',
      'circle-opacity': 1,
      'circle-blur': 0,
      'circle-translate': [0, 0],
      'circle-translate-anchor': 'map',
      'circle-pitch-scale': 'map',
      'circle-pitch-alignment': 'viewport',
      'circle-stroke-width': 0,
      'circle-stroke-color': '#000',
      'circle-stroke-opacity': 1
    },
    {
      visibility: 'visible'
    }
  ),
  line: new VueiClient.commontypes.LineStyle(
    {
      'line-opacity': 1,
      'line-color': '#3fb1e3',
      'line-width': 3,
      'line-blur': 1
    },
    {
      'line-cap': 'butt',
      'line-join': 'miter',
      visibility: 'visible'
    }
  ),
  fill: new VueiClient.commontypes.FillStyle(
    {
      'fill-opacity': 0.8,
      'fill-color': '#3fb1e3',
      'fill-translate': [0, 0],
      'fill-antialias': true,
      'fill-outline-color': '#3fb1e3',
      'fill-translate-anchor': 'map'
    },
    {
      visibility: 'visible'
    }
  ),
  strokeLine: new VueiClient.commontypes.LineStyle(
    {
      'line-opacity': 1,
      'line-color': '#3fb1e3',
      'fill-outline-color': '#3fb1e3'
    },
    {
      visibility: 'visible'
    }
  )
};
```

图层样式

| 参数       | 说明                        | 类型                        | 可选值 | 默认值 |
| :--------- | :-------------------------- | :-------------------------- | :----- | :----- |
| circle     | MapboxGL 点图层样式配置     | [CircleStyle](#circlestyle) | -      | -      |
| line       | MapboxGL 线图层样式配置     | [LineStyle](#linestyle)     | -      | -      |
| fill       | MapboxGL 面图层样式配置     | [FillStyle](#fillstyle)     | -      | -      |
| strokeLine | MapboxGL 面图层边框样式配置 | [LineStyle](#linestyle)     | -      | -      |

## CircleStyle

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let circleStyle = new VueiClient.commontypes.CircleStyle(
  {
    'circle-radius': 6,
    'circle-color': '#3fb1e3',
    'circle-opacity': 1,
    'circle-blur': 0,
    'circle-translate': [0, 0],
    'circle-translate-anchor': 'map',
    'circle-pitch-scale': 'map',
    'circle-pitch-alignment': 'viewport',
    'circle-stroke-width': 0,
    'circle-stroke-color': '#000',
    'circle-stroke-opacity': 1
  },
  {
    visibility: 'visible'
  }
);
```

点样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)   | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## LineStyle

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let lineStyle = new VueiClient.commontypes.LineStyle(
  {
    'line-opacity': 1,
    'line-color': '#3fb1e3',
    'line-width': 3,
    'line-blur': 1
  },
  {
    'line-cap': 'butt',
    'line-join': 'miter',
    visibility: 'visible'
  }
);
```

线样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)   | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## FillStyle

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let fillStyle = new VueiClient.commontypes.FillStyle(
  {
    'fill-opacity': 0.8,
    'fill-color': '#3fb1e3',
    'fill-translate': [0, 0],
    'fill-antialias': true,
    'fill-outline-color': '#3fb1e3',
    'fill-translate-anchor': 'map'
  },
  {
    visibility: 'visible'
  }
);
```

面样式

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)   | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## SymbolStyle

symbol 样式

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let symbolStyle = new VueiClient.commontypes.SymbolStyle(
  {
    'text-color': '#202',
    'text-halo-color': '#fff',
    'text-halo-width': 2
  },
  {
    'text-field': 'symbol',
    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size': 11,
    'text-transform': 'uppercase',
    'text-letter-spacing': 0.05,
    'text-offset': [0, 1.5],
    visibility: 'visible'
  }
);
```

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)   | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## HeatMapStyle

热力图样式

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let heatMapStyle = new VueiClient.commontypes.HeatMapStyle(
  {
    'heatmap-radius': 30,
    'heatmap-weight': 1,
    'heatmap-intensity': 1,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(0, 0, 255, 0)',
      0.1,
      'royalblue',
      0.3,
      'cyan',
      0.5,
      'lime',
      0.7,
      'yellow',
      1,
      'red'
    ],
    'heatmap-opacity': 1
  },
  {
    visibility: 'visible'
  }
);
```

| 参数   | 说明                        | 类型                                                                       | 可选值 | 默认值 |
| :----- | :-------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| paint  | MapboxGL 点图层 Paint 配置  | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)   | -      | -      |
| layout | MapboxGL 点图层 Layout 配置 | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |

## RestMapParameter

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let restMapParameter = new VueiClient.commontypes.RestMapParameter({
  url: 'http://support.supermap.com.cn:8090/iserver/services/map-world/rest/maps/World',
  attributeFilter: 'SmID>0',
  layerName: 'Capitals@World.1'
});
```

| 参数            | 说明           | 类型   | 可选值 | 默认值                   |
| :-------------- | :------------- | :----- | :----- | :----------------------- |
| type            | 服务类型       | string | -      | 'iServer'                |
| url             | 服务地址       | string | -      | -                        |
| layerName       | 查询图层名     | string | -      | -                        |
| attributeFilter | 属性过滤条件   | string | -      | -                        |
| maxFeatures     | 要素最大返回数 | number | -      | 20                       |
| name            | 服务名称       | string | -      | 'SuperMap Rest 地图服务' |

## RestDataParameter

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let restDataParameter = new VueiClient.commontypes.RestDataParameter({
  url: host + 'http://support.supermap.com.cn:8090/iserver/services/data-world/rest/data',
  attributeFilter: "NAME='Huang He'",
  dataName: ['World:Countries']
});
```

| 参数            | 说明           | 类型     | 可选值 | 默认值                   |
| :-------------- | :------------- | :------- | :----- | :----------------------- |
| type            | 服务类型       | string   | -      | 'iServer'                |
| url             | 服务地址       | string   | -      | -                        |
| dataName        | 查询数据集名   | string[] | -      | -                        |
| attributeFilter | 属性过滤条件   | string   | -      | -                        |
| maxFeatures     | 要素最大返回数 | number   | -      | 20                       |
| name            | 服务名称       | string   | -      | 'SuperMap Rest 数据服务' |

## iPortalDataParameter

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let iPortalDataParameter = new VueiClient.commontypes.iPortalDataParameter({
  url: 'https://iportal.supermap.io/iportal/web/datas/676516522',
  attributeFilter: "机场='大理'"
});
```

| 参数            | 说明                | 类型    | 可选值 | 默认值                  |
| :-------------- | :------------------ | :------ | :----- | :---------------------- |
| type            | 服务类型            | string  | -      | 'iPortal'               |
| url             | 服务地址            | string  | -      | -                       |
| attributeFilter | 属性过滤条件        | string  | -      | -                       |
| maxFeatures     | 要素最大返回数      | number  | -      | 20                      |
| name            | 服务名称            | string  | -      | 'SuperMap iPortal 数据' |
| withCredentials | 请求是否携带 cookie | boolean | -      | false                   |

## GeoJSONParameter

```js
import VueiClient from '@supermap/vue-iclient-mapboxgl';

let geoJSONParameter = new VueiClient.commontypes.GeoJSONParameter({
  geoJSON: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          icon: 'theatre1'
        },
        geometry: {
          type: 'Point',
          coordinates: [-77.038659, 38.931567]
        }
      },
      {
        type: 'Feature',
        properties: {
          icon: 'theatre2'
        },
        geometry: {
          type: 'Point',
          coordinates: [-77.003168, 38.894651]
        }
      }
    ]
  },
  maxFeatures: 100
});
```

| 参数        | 说明           | 类型                            | 可选值 | 默认值    |
| :---------- | :------------- | :------------------------------ | :----- | :-------- |
| type        | 服务类型       | string                          | -      | 'geoJSON' |
| geoJSON     | GeoJSON 数据   | [GeoJSON](https://geojson.org/) | -      | -         |
| maxFeatures | 要素最大返回数 | number                          | -      | 20        |
