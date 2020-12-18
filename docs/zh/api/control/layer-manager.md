# 图层管理

<sm-iframe src="https://iclient.supermap.io/examples/component/components_layerManager_vue.html"></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions">
  <sm-layer-manager position="top-left" :layers="layers"></sm-layer-manager>
</sm-web-map>

<script>
new Vue({
  el: '#main',
  data() {
    return {
      layers: [
        {
          title: '直辖市',
          children: [
            {
              title: '上海',
              mapInfo: {
                serverUrl: 'https://www.supermapol.com/',
                mapId: 394538195,
                layerFilter: function(layer) {
                  if (layer.name === '上海_县级行政区划图@公众数据') {
                    return true;
                  }
                  return false;
                }
              }
            }
          ]
        }
      ]
    };
  }
});
</script>
```

### Attributes

| 参数             | 说明                                                                            | 类型                                             | 可选值                                                       | 默认值                            |
| :--------------- | :------------------------------------------------------------------------------ | :----------------------------------------------- | :----------------------------------------------------------- | :-------------------------------- |
| layers           | 树节点数据                                                                      | -                                                | <a href="#layer">layer</a>[ ]                                | -                                 |
| replaceFields    | 替换 treeNode 中 title,key,children 字段为 treeData 中对应的字段                | {children:'children', title:'title', key:'key' } | object                                                       | -                                 |
| defaultExpandAll | 默认展开所有树节点                                                              | false                                            | boolean                                                      | -                                 |
| position         | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                           | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                        |
| iconClass        | 收缩按钮 Icon 类名                                                              | string                                           | -                                                            | 'sm-components-icon-layer-manager' |
| headerName       | 标题名                                                                          | string                                           | -                                                            | '图层管理'                        |
| autoRotate       | 收缩按钮是否自动旋转                                                            | boolean                                          | -                                                            | false                             |
| collapsed        | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean                                          | -                                                            | true                              |

### layer

| 参数     | 说明         | 类型                           | 可选值 | 默认值 |
| :------- | :----------- | :----------------------------- | :----- | :----- |
| title    | 标题         | string                         | -      | -      |
| children | 子节点数组   | array                          | -      | -      |
| mapInfo  | 地图配置对象 | <a href="#mapinfo">mapInfo</a> | -      | -      |

### mapInfo

| 参数            | 说明                               | 类型     | 可选值 | 默认值                     |
| :-------------- | :--------------------------------- | :------- | :----- | :------------------------- |
| serverUrl       | SuperMap iPortal/Online 服务器地址 | string   | -      | https://www.supermapol.com |
| mapId           | iPortal Online 地图 ID             | number   | -      | -                          |
| withCredentials | 请求是否携带 cookie                | boolean  | -      | false                      |
| layerFilter     | 根据图层信息筛选图层是否加载       | function | -      | function() { return true}  |
