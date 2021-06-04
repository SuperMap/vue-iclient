# 文本

```vue
<sm-config-provider prefixCls="ant">
  <sm-button>按钮</sm-button>
</sm-config-provider>
```

### Attributes

| 参数                         | 说明                                                        | 类型                                                   | 可选值                                                     | 默认值     |
| :--------------------------- | :---------------------------------------------------------- | :----------------------------------------------------- | :---------- | :------- |
| locale                       | 语言包配置，语言包可到 ant-design-vue/es/locale 目录下寻找    | object                                                 | -           | -        |
| prefixCls                    | 设置统一样式前缀。注意：需要配合 less 变量 @ant-prefix 使用    | string                                                 | -           | -        |
| autoInsertSpaceInButton      | 设置为 false 时，移除按钮中 2 个汉字之间的空格                 | boolean                                                | -           |true      |
| csp                          | 设置 Content Security Policy 配置                             | { nonce: string }                                      | -           |-         |
| renderEmpty                  | 自定义组件空状态。参考 空状态                                  | slot-scope \| Function(componentName: string): VNode   | -           |-         |
| getPopupContainer            | 弹出框（Select, Tooltip 等等）渲染父节点，默认渲染到 body 上。  | Function(triggerNode, dialogContext)                  | -           |() => document.body      |
| pageHeader                   | 统一设置 pageHeader 的 ghost，参考 pageHeader                  |  { ghost: boolean }                                   | -           |'true'    |
| transformCellText            | Table 数据渲染前可以再次改变，一般用户空数据的默认配置               | Function({ text, column, record, index }) => any       | -         |-        |



