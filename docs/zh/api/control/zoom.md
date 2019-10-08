# 缩放

<sm-iframe src="http://iclient.supermap.io/examples/component/components_zoom_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-zoom :show-zoom-slider="true"></sm-zoom>
</sm-web-map>
```

### Attributes

| 参数           | 说明                                                                            | 类型    | 可选值                                      | 默认值   |
| :------------- | :------------------------------------------------------------------------------ | :------ | :------------------------------------------ | :------- |
| position       | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | top-left/top-right/bottom-left/bottom-right | top-left |
| showZoomSlider | 是否显示滑动条                                                                  | boolean | -                                           | false    |
