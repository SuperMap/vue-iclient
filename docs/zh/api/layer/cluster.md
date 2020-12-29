# 点聚合图层

<sm-iframe src="https://iclient.supermap.io/examples/component/components_cluster_vue.html"></sm-iframe>

```html
<sm-web-map server-url="https://iportal.supermap.io/iportal" map-id="1329428269">
  <sm-cluster-layer :data="culsterLayerData" :radius="100"></sm-cluster-layer>
</sm-web-map>
```

```js
<script>
  $.get('../data/chinaEarthquake.csv', function(response) {
    var dataObj = Papa.parse(response, {
      skipEmptyLines: true,
      header: true
    });

    var data = dataObj.data;
    var geojson = {
      type: 'FeatureCollection',
      features: []
    };

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var date = new Date(item.date);
      var year = date.getFullYear();

      //2w+地震数据
      if (year > 2000 && year < 2015) {
        var feature = {
          type: 'feature',
          geometry: {
            type: 'Point',
            coordinates: []
          },
          properties: {
            value: parseFloat(item.level)
          }
        };
        feature.geometry.coordinates = [parseFloat(item.X), parseFloat(item.Y)];
        geojson.features.push(feature);
      }
    }

    new Vue({
      el: '#main',
      data() {
        return {
          culsterLayerData: geojson
        };
      }
    });
  });
</script>
```

### Attributes

| 参数                     | 说明                     | 类型                                                                                                                                                                                          | 可选值 | 默认值 |
| :----------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| data                     | 图层 GeoJSON 数据        | [GeoJSON](https://geojson.org/)                                                                                                                                                               | -      | -      |
| clusteredPointStyle      | 未聚合点的 Paint 对象    | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle)                                                                                                                               | -      | -      |
| unclusteredPointStyle    | 聚合点的 Paint 对象      | [CircleStyle](/zh/api/common-types/common-types.md#circlestyle)                                                                                                                               | -      | -      |
| clusteredPointTextLayout | 聚合点的文本 layout 对象 | object。参照 [layout options](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property)                                                                                               | -      | -      |
| maxZoom                  | 聚类点的最大缩放级别     | number                                                                                                                                                                                        | -      | 14     |
| radius                   | 聚合点半径               | number                                                                                                                                                                                        | -      | 50     |
