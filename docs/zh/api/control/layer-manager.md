# 图层管理

<sm-iframe src="http://iclient.supermap.io/examples/component/components_layerManager_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
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
              mapInfo: { serverUrl: 'https://www.supermapol.com/', mapId: 394538195, ignoreBaseLayer: true }
            },
            {
              title: '天津',
              mapInfo: { serverUrl: 'https://www.supermapol.com/', mapId: 849848633, ignoreBaseLayer: true }
            },
            {
              title: '北京',
              mapInfo: { serverUrl: 'https://www.supermapol.com/', mapId: 1837435007, ignoreBaseLayer: true }
            },
            {
              title: '重庆',
              mapInfo: { serverUrl: 'https://www.supermapol.com/', mapId: 1589273415, ignoreBaseLayer: true }
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
| layers           | 树节点数据 <a href="#layers">配置项</a>                                                                     | -                                                | array                                                        | -                                 |
| replaceFields    | 替换 treeNode 中 title,key,children 字段为 treeData 中对应的字段                | {children:'children', title:'title', key:'key' } | object                                                       | -                                 |
| defaultExpandAll | 默认展开所有树节点                                                              | false                                            | boolean                                                      | -                                 |
| position         | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                           | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                        |
| iconClass        | 收缩按钮 Icon 类名                                                              | string                                           | -                                                            | 'sm-components-icons-layer-style' |
| headerName       | 标题名                                                                          | string                                           | -                                                            | '图层管理'                        |
| autoRotate       | 收缩按钮是否自动旋转                                                            | boolean                                          | -                                                            | false                             |
| collapsed        | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean                                          | -                                                            | true                              |

### layers

| 参数            | 说明                  | 类型                                                                          | 可选值                 | 默认值    |
| :-------------- | :-------------------- | :---------------------------------------------------------------------------- | :--------------------- | :-------- |
| title            | 标题              | string                                                                        | - | -
| children             | 子节点数组              | array                                                                        | -                      | -         |
| mapInfo | 地图配置对象 <a href="#mapInfo">配置项</a> | object                                                                       | -                      | -     |

### mapInfo

| 参数            | 说明                  | 类型                                                                          | 可选值                 | 默认值    |
| :-------------- | :-------------------- | :---------------------------------------------------------------------------- | :--------------------- | :-------- |
| serverUrl            | SuperMap iPortal/Online 服务器地址              | string                                                                        | - | http://www.supermapol.com
| mapId             | iPortal              | Online 地图 ID                                                                        | number                      | -         |
| withCredentials | 请求是否携带 cookie | boolean                                                                       | -                      | false     |
| ignoreBaseLayer | 不添加底图 | boolean | - | false
