# 底图切换

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-base-layer-switcher position="bottom-right" :layers="layers" />
</sm-web-map>
```

### Attributes

| 参数          | 说明               | 类型                            | 可选值  | 默认值 |
|:--------------|:-----------------|:--------------------------------|:--------|:-------|
| layers        | 底图列表           | Array<[LayerItem](#layeritem)>  | -       | -      |
| defaultLayer  | 默认底图的唯一标识 | string                          | string  | -      |
| baseLayerInfo | 原始底图信息       | [BaseLayerInfo](#baselayerinfo) | boolean | true   |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### LayerItem

| 参数      | 说明            | 类型                                                                    | 是否必填 |
|:----------|:--------------|:------------------------------------------------------------------------|:--------|
| id        | 底图唯一标识    | string                                                                  | 是       |
| title     | 底图名称        | string                                                                  | 是       |
| layers    | MapboxGL 图层   | Array<[Layers](https://docs.mapbox.com/style-spec/reference/layers/)>   | 是       |
| sources   | MapboxGL 数据源 | Array<[Sources](https://docs.mapbox.com/style-spec/reference/sources/)> | 是       |
| thumbnail | 底图缩略图      | string                                                                  | 否       |

### BaseLayerInfo

| 参数      | 说明       | 类型    | 是否必填 |
|:----------|:---------|:--------|:--------|
| show      | 显示原底图 | boolean | 是       |
| title     | 底图名称   | string  | 是       |
| thumbnail | 底图缩略图 | string  | 否       |
