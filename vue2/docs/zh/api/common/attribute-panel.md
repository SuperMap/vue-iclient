# 属性面板

```vue
<sm-attribute-panel
  :attrbiutes="[
    {
        "title": "链接",
        "value": "www.test1.com"
    },
    {
        "title": "文本",
        "value": "test1"
    }
  ]"
></sm-attribute-panel>
```

### Attributes

| 参数           | 说明                                                                                   | 类型    | 可选值 | 默认值 |
| :------------- | :------------------------------------------------------------------------------------- | :------ | :----- | :----- |
| title          | 标题                                                                                   | string  | -      | -      |
| attributes     | 属性数据,格式为 [{ title: '', value: ''}]                                                                               | array   | -      | []     |
| titleRender     | 属性数据标题列渲染函数，格式为 Function(text, record, index) {}                                                                               | function   | -      | -     |
| valueRender     | 属性数据值列渲染函数，格式为 Function(text, record, index) {}                                                                              | function   | -      | -     |
| showBorder     | 显示边框                                                                               | boolean | -      | true   |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)
