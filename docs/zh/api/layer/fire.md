# 动态火焰图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_fire_layer_vue.html"></sm-iframe>

```html
<sm-web-map :map-options="mapOptions" style="background:black">
  <sm-fire-layer :features="features" :model-scale="5.41843220338983e-6"></sm-fire-layer>
</sm-web-map>
```

```js
<script>
  $.get("../data/fire.json", function(features) {
    var features = features;
    new Vue({
      el: "#main",
      data() {
          var mapUrl = "https://iserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark";
          return {
              mapOptions: {
                  container: "map",
                  style: {
                      version: 8,
                      sources: {
                          "raster-tiles": {
                              type: "raster",
                              tiles: [mapUrl + "/zxyTileImage.png?z={z}&x={x}&y={y}"],
                              tileSize: 256
                          },
                          buildings: {
                              type: "geojson",
                              data: "https://iclient.supermap.io/examples/data/buildings.json"
                          }
                      },
                      layers: [
                          {
                              id: "simple-tiles",
                              type: "raster",
                              source: "raster-tiles",
                              minzoom: 0,
                              maxzoom: 22
                          },
                          {
                              id: "3d-buildings",
                              source: "buildings",
                              type: "fill-extrusion",
                              paint: {
                                  "fill-extrusion-color": [
                                      "case",
                                      ["<", ["get", "height"], 2],
                                      "#fbb03b",
                                      ["<", ["get", "height"], 4],
                                      "#223b53",
                                      ["<", ["get", "height"], 8],
                                      "#15D1F2",
                                      ["<", ["get", "height"], 16],
                                      "#15D1F2",
                                      "#3bb2d0"
                                  ],
                                  "fill-extrusion-height": ["*", ["get", "height"], 5],
                                  "fill-extrusion-opacity": 0.6
                              }
                          }
                      ]
                  },
                  center: [116.45423056455218, 39.91980158816503],
                  zoom: 14.27415578362124,
                  bearing: 0.8568,
                  pitch: 60
              },
              features: features
          };
      }
    });
  });
</script>
```

### Attributes

| 参数       | 说明                                                                                                   | 类型                                                       | 可选值 | 默认值              |
| :--------- | :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- | :----- | :------------------ |
| features   | 图层要素                                                                                               | FeatureCollection。参考[OSCHINA](https://www.oschina.net/translate/geojson-spec?cmp) | -      | -                   |
| modelScale | 指定 CSS 属性 transform 缩放的比例。参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scale) | number                                                     | -      | 5.41843220338983e-6 |

> 支持 [Layer 混入参数](/zh/api/mixin/mixin.md#layer)
