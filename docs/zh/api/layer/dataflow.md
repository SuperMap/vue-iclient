# 数据流图层

<sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_dataflow_vue.html"></sm-iframe>

```html
<sm-web-map :map-options="mapOptions" @load="mapIsLoaded">
  <sm-deckgl-layer layer-type="hexagon-layer" :options="deckglOptions"></sm-deckgl-layer>
</sm-web-map>
```

```js
<script>
  var wsHost = "ws:\//" + (window.isLocal ? document.location.hostname + ":8800" : "iclsvrws.supermap.io");

  // 模拟 dataflow 实时数据
  var featureResult, dataFlowBroadcast, timer;
  function broadcast() {
      var features = [];
      for (var index = 0; index < featureResult.length; index++) {
          var count = parseInt(Math.random() * featureResult.length);
          var geometry = featureResult[count].geometry;
          var feature = {
              geometry: geometry,
              type: "Feature",
              properties: { id: index + 1, time: new Date() }
          };
          features.push(feature);
      }
      dataFlowBroadcast.broadcast(features);
  }

  function query() {
      var param = new SuperMap.QueryBySQLParameters({
          queryParams: { name: "Capitals@World#3", attributeFilter: "SMID > 0" }
      });
      var queryService = new mapboxgl.supermap.QueryService(
          host + "/iserver/services/map-world/rest/maps/World"
      ).queryBySQL(param, function(serviceResult) {
          featureResult = serviceResult.result.recordsets[0].features.features;
          dataFlowBroadcast = new mapboxgl.supermap.DataFlowService(
              wsHost + "/iserver/services/dataflowTest/dataflow"
          ).initBroadcast();
          dataFlowBroadcast.on("broadcastSocketConnected", function(e) {
              timer = window.setInterval(broadcast, 2000);
          });
      });
  }
  query();

  new Vue({
    el: '#main',
    data() {
      return {
        dataFlowUrl: wsHost + "/iserver/services/dataflowTest/dataflow",
        layerStyle: {
            circle: new SuperMap.Components.commontypes.CircleStyle({
                "circle-color": "#3fb1e3",
                "circle-radius": 6
            })
        },
        mapOptions: {
          container: 'map', // container id
          style: {
            version: 8,
            sources: {
              'raster-tiles': {
                type: 'raster',
                tiles: [
                    'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}',
                ],
                tileSize: 256,
              },
            },
            layers: [
              {
                id: 'simple-tiles',
                type: 'raster',
                source: 'raster-tiles',
                minzoom: 0,
                maxzoom: 22,
              },
            ],
          },
          center: [120.143, 30.236],
          zoom: 0
        },
      };
    }
  });
</script>
```

### Attributes

| 参数          | 说明                                                                                                                                                                                | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| serviceUrl    | 数据流服务地址                                                                                                                                                                      | string                                                                                                                                                                                        | -      | -      |
| registerToken | SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制、参照 [SuperMap iClient API](http://iclient.supermap.io/docs/mapboxgl/SuperMap.SecurityManager.html#.registerToken) | string                                                                                                                                                                                        | -      | -      |
| geometry      | 指定几何范围。该范围内的要素才能被订阅                                                                                                                                              | object                                                                                                                                                                                        | -      | -      |
| excludeField  | 排除字段                                                                                                                                                                            | object                                                                                                                                                                                        | -      | -      |
| layerStyle    | 图层样式                                                                                                                                                                            | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle) \| [LineStyle](/zh/api/common-types/common-types.md#linestyle) \| [FillStyle](/zh/api/common-types/common-types.md#fillstyle) | -      | -      |
