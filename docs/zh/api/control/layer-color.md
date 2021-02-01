# 图层颜色

```vue
  <sm-web-map style="height:700px" serverUrl="https://www.supermapol.com/" mapId="505367620">
    <sm-layer-color :collapsed="false"></sm-layer-color>
  </sm-web-map>
```

### Attributes

| 参数         | 说明                                                                            | 类型    | 可选值                                                       | 默认值                          |
| :----------- | :------------------------------------------------------------------------------ | :------ | :----------------------------------------------------------- | :------------------------------ |
| position     | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                      |
| iconClass    | 收缩按钮 Icon 类名                                                              | string  | -                                                            | 'sm-components-icon-layer-list' |
| headerName   | 标题名                                                                          | string  | -                                                            | '图层颜色'                          |
| collapsed    | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean | -                                                            | true                            |
| splitLine    | 标题与内容分隔线                                                                | boolean | -                                                            | false                           |
| allowReset   | 开启重置                                                                        | boolean | -                                                            | true                            |
| allowCapture | 开启捕捉                                                                        | boolean | -                                                            | true                            |
