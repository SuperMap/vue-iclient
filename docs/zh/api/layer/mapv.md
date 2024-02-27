# MapV 图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_mapv_vue.html"></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions" @load="addPopup">
  <sm-mapv-layer :data="lineDataSet" :options="lineMapvOptions"></sm-mapv-layer>
  <sm-mapv-layer :data="ponitDataSet" :options="pointMapvOptions"></sm-mapv-layer>
</sm-web-map>
```

### Attributes

| 参数    | 说明                                                                                                                       | 类型                            | 可选值 | 默认值 |
| :------ | :------------------------------------------------------------------------------------------------------------------------- | :------------------------------ | :----- | :----- |
| options | 图层可选参数，参照 [SuperMap iClient API](https://iclient.supermap.io/docs/mapboxgl/MapvLayer.html) | object                          | -      | -      |
| data    | MapV 图层数据集                                                                                                            | [GeoJSON](https://geojson.org/) | -      | -      |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
