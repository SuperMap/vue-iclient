# 知识图谱

```vue
<sm-graph-map
  service-url="https://iserver.supermap.io/iserver/services/knowledgeGraph-rivers/restjsr/graph/graphmaps/%E5%9B%BE%E8%B0%B1%E5%9B%BE"
>
</sm-graph-map>
```

### Attributes

| 参数       | 说明                                                                                                                   | 类型                                                                                 | 可选值 | 默认值 |
| :--------- | :--------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :----- | :----- |
| serviceUrl | 数据服务地址。如：http://{server}:{port}/iserver/services/{knowledgeGraph-provider}/restjsr/graph/graphmaps/{graphmap} | string                                                                               | -      | -      |
| autoresize | 组件根元素尺寸变化时图形是否自适应                                                                                     | boolean                                                                              | -      | true   |
| options    | 创建 graph 实例的配置项                                                                                                | [GraphConfig](https://iclient.supermap.io/docs/mapboxgl/KnowledgeGraph.html#.Config) | -      | -      |

### Events

| name  | 说明               | 回调参数        |
| :---- | :----------------- | :-------------- |
| load | 渲染完成 | function() |
