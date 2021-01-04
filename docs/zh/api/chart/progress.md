---
pageClass: progress
---

# 进度条

```vue
<sm-progress strokeColor="red" :style="{ width: '10%', display: 'inline-block' }" type="circle" :percent="80">
</sm-progress>
```

### Attributes

::: tip
与 [ant-design](https://www.antdv.com/components/progress/#API) 配置相同, 新增配置如下：
:::
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :------ | :------------------------------------------------------------------------------ | :--------------- | :----- | :----- |
| percent | 百分比 | number \| string | - | - |
| url | 服务地址 | string | - | - |
| proxy | 服务代理 | string | - | - |
| field | 指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string | - | - |
| startTiming | 是否开启定时刷新 | boolean | - | false |
| frequency | 请求间隔 | number \| string | - | 3 |
| trailColor | 进度条底色 | string | - | '#f3f3f3' |
