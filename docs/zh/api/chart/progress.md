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
与 [ant-design-vue](https://www.antdv.com/components/progress/#API) 配置相同, 新增配置如下：
:::
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :------ | :------------------------------------------------------------------------------ | :--------------- | :----- | :----- |
| percent | 百分比 | number \| string | - | - |
| trailColor | 进度条底色 | string | - | '#f3f3f3' |
| size | 进度条的带下。若类型为 number，则表示圆形进度条画布宽度 | number \| string | 'small' \| 'default' \| 'large' | 'default' |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[第三方服务混入参数](/zh/api/mixin/mixin.md#thirdservice)和[定时刷新混入参数](/zh/api/mixin/mixin.md#timer)
