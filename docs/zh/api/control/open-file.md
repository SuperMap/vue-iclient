# 打开文件

<sm-iframe src="https://iclient.supermap.io/examples/component/components_openfile_vue.html"></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions">
  <sm-open-file :layer-style="layerStyle"></sm-open-file>
</sm-web-map>

<script>
export default {
  data() {
      return {
          mapOptions: {
            container: "map", // container id
            style: {
                version: 8,
                sources: {
                    "raster-tiles": {
                        type: "raster",
                        tiles: [
                            "https://iserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark/zxyTileImage.png?z={z}&x={x}&y={y}"
                        ],
                        tileSize: 256
                    }
                },
                layers: [
                    {
                        id: "simple-tiles",
                        type: "raster",
                        source: "raster-tiles",
                        minzoom: 0,
                        maxzoom: 22
                    }
                ]
            },
            center: [120.143, 30.236],
            zoom: 3
          },
          layerStyle: {
              line: new SuperMap.Components.commontypes.LineStyle(),
              circle: new SuperMap.Components.commontypes.CircleStyle(),
              fill: new SuperMap.Components.commontypes.FillStyle()
          },
      };
}
</script>
```

### Attributes

| 参数           | 说明                                                                 | 类型                                                                                                                                                                                          | 可选值                                                                                                                                                              | 默认值                                                                                                                                                  |
| :------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| text           | 文字                                                                 | string                                                                                                                                                                                        | -                                                                                                                                                                   | '打开文件'                                                                                                                                              |
| fontStyle      | 设置组件的样式，例如：文字大小 `fontSize` 和 圆角大小 `borderRadius` | object                                                                                                                                                                                        | -                                                                                                                                                                   | -                                                                                                                                                       |
| accept         | 支持打开的文件类型                                                   | string[]                                                                                                                                                                                      | '.json' \| '.geojson' \| '.csv' \| '.xlsx' \| '.xls' \| '.shp' \| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' \| 'application/vnd.ms-excel' | ['.json', '.geojson', '.csv', '.xlsx', '.xls', '.shp', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] |
| layerStyle     | 图层样式                                                             | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -                                                                                                                                                                   | -                                                                                                                                                       |
| addToMap       | 是否把打开的数据渲染到地图上                                         | boolean                                                                                                                                                                                       | -                                                                                                                                                                   | true                                                                                                                                                    |
| fitBounds      | 图层是否自适应地图                                                   | boolean                                                                                                                                                                                       | -                                                                                                                                                                   | true                                                                                                                                                    |
| clearLastLayer | 是否清除上一次打开的数据                                             | boolean                                                                                                                                                                                       | -                                                                                                                                                                   | true                                                                                                                                                    |
| notify         | 是否开启打开文件的操作提示                                           | boolean                                                                                                                                                                                       | -                                                                                                                                                                   | true                                                                                                                                                    |
