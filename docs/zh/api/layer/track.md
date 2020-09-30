# 轨迹图层

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal" map-id="1329428269">
  <sm-track-layer :style-options="styleOptions"></sm-track-layer>
</sm-web-map>
```

### Attributes

| 参数              | 说明                                         | 类型                                                                                                                                                                                          | 可选值                                         | 默认值 |
| :---------------- | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :----- |
| layerId           | 图层 id                                      | string                                                                                                                                                                                        | -                                              | -      |
| loaderType        | 数据类型                                     | string                                                                                                                                                                                        | 'GLTF' \| 'OBJ2' \| 'IMAGE'                    | -      |
| url               | 3D 模型地址或图片地址                        | string                                                                                                                                                                                        | -                                              | -      |
| displayLine       | 轨迹线绘制类型                               | string                                                                                                                                                                                        | 'All' \| 'TailLine' \| ''                      | -      |
| layerStyle        | 轨迹线样式                                   | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | - | - |
| trackPoints          | 历史轨迹点集合（[GeoJSON FeatureCollection](https://tools.ietf.org/html/rfc7946#section-3.3)）, FeatureCollection 中的每个 Feature 应该是点要素（[GeoJSON Point Geometry](https://tools.ietf.org/html/rfc7946#section-3.1.2)），每个点要素properties中都应包含timestamp字段。                           | [GeoJSON Points](https://tools.ietf.org/html/rfc7946#section-3.1.3)
| position | 位置信息 可以通过改变该值实现模型或图片位置更新。<a href="#positionconfig">配置项</a>  | object | - |
| direction         | 模型初始方向 (只适用 3D 模型)                | object                                                                                                                                                                                        | <a href="#directionconfig">directionConfig</a> | -
| unit              | 模型的单位 (只适用 3D 模型)                  | string                                                                                                                                                                                        | 'meter' \| 'centimeter' \| millimeter \|       | -      |
| scale             | 模型的比例大小 (当 fitBounds 为 true 时无效) | number                                                                                                                                                                                        | -                                              | -      |
| fitBounds         | 模型大小适应地图                             | boolean                                                                                                                                                                                       | -                                              | false  |
| followCamera      | 是否跟随镜头                                 | boolean                                                                                                                                                                                       | -                                              | false  |

### directionConfig

| 参数   | 说明     | 类型   | 可选值                                    | 默认值 |
| :----- | :------- | :----- | :---------------------------------------- | :----- |
| front  | 正面朝向 | string | 'x' \| 'y' \| 'z' \| '-x' \| '-y' \| '-z' | -      |
| bottom | 底部朝向 | string | 'x' \| 'y' \| 'z' \| '-x' \| '-y' \| '-z' | -      |

### positionConfig
| 参数   | 说明     | 类型   | 可选值                                    | 默认值 |
| :----- | :------- | :----- | :---------------------------------------- | :----- |
| currentTimestamp  | 当前时间戳 | number | - | - |
| nextTimestamp | 下一个点的时间戳 | number | - | - |
| prevTimestamp  | 上一个点时间戳 | number | - | - |
| step  | 两个点的时间间隔 | number | - | - |
