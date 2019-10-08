# Echarts 图层

<sm-iframe src="http://iclient.supermap.io/examples/component/components_echarts_vue.html"></sm-iframe>

```html
<sm-web-map :map-options="mapOptions">
  <sm-echarts-layer :options="echartsOptions"></sm-echarts-layer>
</sm-web-map>
```

```js
<script>
  $.get('../data/changchunBus.json', function(data) {
    var echartsOptions = {
      animation: false,
      GLMap: {
        roam: true,
      },
      coordinateSystem: 'GLMap',
      geo: {
        map: 'GLMap',
      },
      series: [
        {
          type: 'lines',
          polyline: true,
          data: data,
          silent: true,
          lineStyle: {
            normal: {
              opacity: 0.2,
              width: 1,
            },
          },
          progressiveThreshold: 500,
          progressive: 100,
        },
        {
          type: 'lines',
          coordinateSystem: 'GLMap',
          polyline: true,
          data: data,
          lineStyle: {
            normal: {
              width: 0.2,
            },
          },
          effect: {
            constantSpeed: 40,
            show: true,
            trailLength: 0.02,
            symbolSize: 2,
          },
        },
      ],
    };
    new Vue({
      el: '#main',
      data() {
        return {
          echartsOptions: echartsOptions,
          mapOptions: {
            container: 'map', // container id
            style: {
              version: 8,
              sources: {
                'raster-tiles': {
                  type: 'raster',
                  tiles: [
                      'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/ChinaDark/zxyTileImage.png?z={z}&x={x}&y={y}',
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
            center: [125.35, 43.86],
            zoom: 10,
          },
        };
      },
    });
  });
</script>
```

### Attributes

| 参数    | 说明                                                                                     | 类型   | 可选值 | 默认值 |
| :------ | :--------------------------------------------------------------------------------------- | :----- | :----- | :----- |
| options | 图层可选参数，参照 [SuperMap echartsLayer API](https://github.com/SuperMap/echartsLayer) | object | -      | -      |
