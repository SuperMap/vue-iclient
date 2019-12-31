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
| data    | MapV 图层数据集                                                                                                            | [GeoJSON](https://geojson.org/) | -      | -      |
| options | 图层可选参数，参照 [SuperMap iClient API](https://iclient.supermap.io/docs/mapboxgl/mapboxgl.supermap.MapvLayer.html) | object                          | -      | -      |
