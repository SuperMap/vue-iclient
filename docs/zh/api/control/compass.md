# 指南针

<sm-iframe src="https://iclient.supermap.io/examples/component/components_compass_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-compass></sm-compass>
</sm-web-map>
```

### Attributes

| 参数           | 说明                                                                          | 类型    | 可选值                                      | 默认值                          |
| :------------- | :---------------------------------------------------------------------------- | :------ | :------------------------------------------ | :---------------------------- |
| position       | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | top-left/top-right/bottom-left/bottom-right | top-left                      |
| iconClass       | 收缩按钮 Icon 类名                                                            | string | -                                           | 'sm-components-icon-edit'     |
| visualizePitch | 是否旋转指南针的Y轴来显示俯仰角度                                               | boolean | -                                           | false                         |
