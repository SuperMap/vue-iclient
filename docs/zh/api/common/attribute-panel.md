# 属性面板

```vue
<sm-attribute-panel
  :attrbiutes="[
    {
        "attribute": "链接",
        "alias": "bbb",
        "attributeValue": "www.test1.com"
    },
    {
        "attribute": "文本",
        "alias": "text",
        "attributeValue": "test1"
    }
  ]"
></sm-attribute-panel>
```

### Attributes

| 参数           | 说明                                                                                   | 类型    | 可选值 | 默认值 |
| :------------- | :------------------------------------------------------------------------------------- | :------ | :----- | :----- |
| showIcon       | 显示分页                                                                               | boolean | -      | false  |
| currentIndex   | 当前页索引                                                                             | number  | -      | 0      |
| paginationText | 自定义分页文本                                                                         | string  | -      |
| total          | 总分页数                                                                               | number  | -      | -      |
| title          | 标题                                                                                   | string  | -      | -      |
| attributes     | 属性数据                                                                               | array   | -      | []     |
| columns        | 列配置, 具体属性参考[表格列配置文档](https://1x.antdv.com/components/table-cn/#Column) | array   | -      | []     |
| showBorder     | 显示边框                                                                               | boolean | -      | true   |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)
