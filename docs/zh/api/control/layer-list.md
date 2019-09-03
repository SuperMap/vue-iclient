# 图层列表

<sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_layerList_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-layer-list position="top-left"></sm-layer-list>
</sm-web-map>
```


### Attributes

| 参数       | 说明                              | 类型     | 可选值                                      | 默认值                                                    |
| :--------- | :-------------------------------- | :------- | :------------------------------------------ | :-------------------------------------------------------- |
| iconClass  | 收缩按钮 Icon 类名                | string   | -                                           | sm-components-icons-layer-style                           |
| headerName | 标题名                            | string   | -                                           | 图层                                                      |
| position   | 显示位置（添加成 control 时生效） | string   | top-left/top-right/bottom-left/bottom-right | -                                                         |
| autoRotate | 收缩按钮是否自动旋转                      | boolean  | -                                           | false                                                     |
| background | 背景颜色                          | string   | -                                           | rgba(255, 255, 255,0.6)                                   |
| textColor  | 字体颜色                          | string   | -                                           | #333                                                      |
| colorGroup | 色带                              | string[] | -                                           | [ "#3fb1e3", "#6be6c1", "#626c91", "#a0a7e6", "#c4ebad" ] |
