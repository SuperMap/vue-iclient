# 多行文本

```vue
<sm-text-list
  :content="[
    { 站台: '漠河', 省份: '黑龙江1', 海拔: '296', 平均最低气温: '-47', 最热七天气温: '29' },
    { 站台: '塔河', 省份: '黑龙江2', 海拔: '357.4', 平均最低气温: '-42', 最热七天气温: '29' },
    { 站台: '呼玛', 省份: '黑龙江3', 海拔: '177.4', 平均最低气温: '-42', 最热七天气温: '30' },
    { 站台: '额尔古纳右旗', 省份: '内蒙古1', 海拔: '581.4', 平均最低气温: '-42', 最热七天气温: '29' },
    { 站台: '图里河', 省份: '内蒙古2', 海拔: '732.6', 平均最低气温: '-46', 最热七天气温: '27' },
    { 站台: '黑河', 省份: '黑龙江4', 海拔: '166.4', 平均最低气温: '-37', 最热七天气温: '30' },
    { 站台: '满洲里', 省份: '内蒙古3', 海拔: '661.7', 平均最低气温: '-37', 最热七天气温: '30' },
    { 站台: '海拉尔', 省份: '内蒙古4', 海拔: '610', 平均最低气温: '-40', 最热七天气温: '30' },
    { 站台: '小二沟', 省份: '内蒙古5', 海拔: '286', 平均最低气温: '-42', 最热七天气温: '30' },
    { 站台: '嫩江', 省份: '黑龙江5', 海拔: '242.2', 平均最低气温: '-40', 最热七天气温: '30' }
  ]"
  :header="['站台', '省份', '海拔', '平均最低气温', '最热七天气温']"
  :fields="['站台', '省份', '海拔', '平均最低气温', '最热七天气温']"
  fontSize="14"
  :autoRolling="true"
  :rows="6"
  :autoResize="true"
></sm-text-list>
```

### Attributes

| 参数                | 说明                          | 类型                                                                                                                                                                                                                                          | 可选值 | 默认值    |
| :------------------ | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :-------- |
| content             | 显示内容（与 dataset 二选一） | object[]                                                                                                                                                                                                                                      | -      | -         | - |
| dataset             | 数据来源（与 content 二选一） | [iPortalDataParameter](/zh/api/common-types/common-types.md#iportaldataparameter) \| [RestDataParameter](/zh/api/common-types/common-types.md#restdataparameter) \| [GeoJSONParameter](/zh/api/common-types/common-types.md#geojsonparameter) | -      | -         |
| header              | 表头                          | string[]                                                                                                                                                                                                                                      | -      | -         |
| rows                | 显示行数                      | string                                                                                                                                                                                                                                        | -      | 6         |
| autoRolling         | 逐条滚动                      | boolean                                                                                                                                                                                                                                       | -      | false     |
| fontSize            | 字体大小                      | number \| string                                                                                                                                                                                                                              | -      | -         |
| autoResize          | 自适应大小                    | string                                                                                                                                                                                                                                        | -      | true      |
| fields              | 字段名                        | string[]                                                                                                                                                                                                                                      | -      | []        |
| columnWidths        | 列表宽度                      | number[]                                                                                                                                                                                                                                      | -      | []        |
| rowStyle            | 行样式                        | <a href="#rowstyle">rowStyle </a>                                                                                                                                                                                                             | -      | []        |
| headerStyle         | 表头样式                      | <a href="#headerstyle">headerStyle </a>                                                                                                                                                                                                       | -      | []        |
| thresholdsStyle     | 阈值样式                      | <a href="#thresholdsstyle">ThresholdsStyle </a>                                                                                                                                                                                               | -      | []        |
| columns             | 排序和前后缀                  | <a href="#columns">columns </a>                                                                                                                                                                                                               | -      | []        |
| highlightOptions    | 需要高亮的行的 index 的列表   | array                                                                                                                                                                                                                                         | -      | []        |
| highlightCurrentRow | 是否开启高亮当前行            | boolean                                                                                                                                                                                                                                       | -      | true      |
| highlightColor      | 高亮颜色配置                  | string \| function                                                                                                                                                                                                                            | -      | #808080cc |

### headerStyle

| 参数               | 说明               | 类型    | 可选值 | 默认值 |
| :----------------- | :----------------- | :------ | :----- | :----- |
| show               | 是否显示 header    | boolean | -      | true   | - |
| color              | 字体颜色           | string  | -      | -      | - |
| background         | 背景颜色           | string  | -      | -      | - |
| sortBtnSelectColor | 排序图标选中的颜色 | string  | -      | -      | - |
| sortBtnColor       | 排序图标默认颜色   | string  | -      | -      | - |
| height             | 表头的高度         | number  | -      | -      | - |

### rowStyle

| 参数      | 说明                                         | 类型   | 可选值 | 默认值 |
| :-------- | :------------------------------------------- | :----- | :----- | :----- |
| oddStyle  | 奇数行样式（目前只支持配置 background 属性） | object | -      | -      | - |
| evenStyle | 偶数行样式（目前只支持配置 background 属性） | object | -      | -      | - |
| height    | 行的高度                                     | number | -      | -      | - |

### ThresholdsStyle

```json
// 设置每列不同阈值下的背景颜色和字体颜色，示例如下：
[
  // 第一列的background阈值配置
  {
    "type": "background",
    "data": [
      {
        "max": 85,
        "color": "rgba(14, 229, 18, 0)"
      },
      {
        "min": 85,
        "color": "#E31C1C"
      }
    ]
  },
  // 第一列的color阈值配置
  {
    "type": "color",
    "data": [
      {
        "max": 800,
        "color": "#E31C1C"
      },
      {
        "min": 800,
        "max": 1200,
        "color": "#F05940"
      },
      {
        "min": 1200,
        "color": "#0CD54A"
      }
    ]
  },
  // 第二列的color阈值配置
  {
    "type": "color",
    "data": [
      {
        "max": 204,
        "color": "#0CD54A"
      },
      {
        "min": 400,
        "color": "#E31C1C"
      }
    ]
  }
]
```

### columns

```json
// 每一列都可以设置排序和前后缀：
// （1）sort 属性可选项： true | false | undefined
// （2）defaultSortType 属性可选项：'ascend' | 'descend' | 'none'
// （3）fixInfo 属性配置前后缀
[
  {
    "header": "服务",
    "field": "name",
    "sort": true,
    "defaultSortType": "none",
    "fixInfo": {
      "prefix": "",
      "suffix": ""
    },
    "width": 0
  },
  {
    "header": "访问人数 ",
    "field": "visitCount",
    "sort": true,
    "defaultSortType": "ascend",
    "fixInfo": {
      "prefix": "",
      "suffix": ""
    },
    "width": 0
  }
]
```
