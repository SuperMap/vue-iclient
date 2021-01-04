# 等级符号专题图

<sm-iframe src="https://iclient.supermap.io/examples/component/components_ranksymboltheme_vue.html"></sm-iframe>

```html
<sm-web-map :map-options="mapOptions" @load="mapIsLoaded">
  <sm-ranksymbol-theme-layer
    :options="themeOptions"
    :data="features"
    layer-name="RankSymbolThemeLayer"
    charts-type="Circle"
    @load="layerLoaded"
  >
  </sm-ranksymbol-theme-layer>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                                                                             | 类型                                                                                                                                                                                            | 可选值                               | 默认值   |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- | :------- |
| layerName  | 图层名                                                                                                                           | string                                                                                                                                                                                          | -                                    | -        |
| symbolType | 符号类型                                                                                                                         | string                                                                                                                                                                                          | 'Bar' \| 'Line' \| 'Pie' \| 'Circle' | 'Circle' |
| options    | 图层可选参数，参照 [SuperMap iClient API](https://iclient.supermap.io/docs/mapboxgl/mapboxgl.supermap.RankSymbolThemeLayer.html) | object                                                                                                                                                                                          | -                                    | -        |
| data       | 图层要素数据                                                                                                                     | [mapboxgl.supermap.ThemeFeature](https://iclient.supermap.io/docs/mapboxgl/mapboxgl.supermap.ThemeFeature.html) \| [SuperMap.ServerFeature](https://iclient.supermap.io/web/apis/mapboxgl.html) | -                                    | -        |

### Events

| name | 说明             | 回调参数     | 参数说明                                         |
| :--- | :--------------- | :----------- | :--------------------------------------------- |
| load | 图层加载完成事件 | (layer, map) | layer 指创建的图层实例， map 指关联的 map 实例 |
