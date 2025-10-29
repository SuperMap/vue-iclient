# 数据级联组件

```vue
<sm-feature-cascader :config="{
    dataset: {
        url: 'http://support.supermap.com.cn:8090/iserver/services/data-Jingjin/rest/data',
        dataName: ['Jingjin:BaseMap_P'],
        type: 'iServer'
    },
    idField: 'SmID',
    titleField: 'NAME',
}"></sm-feature-cascader>
```

### Attributes

| 参数                | 说明                                                           | 类型                                                                                                                                                                                                                                                | 可选值 | 默认值  |
| :------------------ | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :------ |
| config             | 级联数据配置                                                       | Object                                                                                                                                                                                                                                           | -      | -       | - |
| popupClassName              | 自定义浮层类名	                                                           | string                                                                                                                                                                                                                                         | -      | -       |
| changeOnSelect                | （单选时生效）当此项为 true 时，点选每级菜单选项值都会触发change事件                                                       | string                                                                                                                                                                                                                                              | -      | false       |
| value                | 指定选中项                                                      | array                                                                                                                                                                                                                                                                                                                                                                                  | -      | -       |
                                                                                                                                          

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[定时刷新混入参数](/zh/api/mixin/mixin.md#timer)

### config

| 参数               | 说明               | 类型    | 可选值 | 默认值 |
| :----------------- | :----------------- | :------ | :----- | :----- |
| idField           | 标识字段      | string | -      | -   | - |
| titleField        | 显示字段           | string  | -      | -      | - |
| parentField       | 与上一级关联字段，第一级不需要，其余级别都需要           | string  | -      | -      | - |
| dataset           | 数据集信息           | [iServerDataParameter](/zh/api/common-types/common-types.md#iserverdataparameter)  | -      | -      | - |
| children | 下一级配置，和当前参数一致           | object  | -      | -      | - |


### Events

| name | 说明               | 回调参数                                                                         |
| :--- | :----------------- | :------------------------------------------------------------------------------- |
| change | 选择完成后的回调 | function(value, feature) |

