# 混入 (mixin) 参数

## Theme

主题参数

| 参数       | 说明     | 类型      | 可选值 | 默认值 |
| :--------- | :------- | :-------- | :----- | :----- |
| background | 背景颜色 | string    | -      | -      |
| textColor  | 字体颜色 | string    | -      | -      |
| colorGroup | 主题色带 | string[ ] | -      | -      |

## CollapsedCard

卡片参数

| 参数       | 说明                                                                                          | 类型    | 可选值                                                       | 默认值     |
| :--------- | :-------------------------------------------------------------------------------------------- | :------ | :----------------------------------------------------------- | :--------- |
| position   | 控件添加到地图上的位置。添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |
| iconClass  | 收缩按钮的 Font class 类名                                                                    | string  | -                                                            | -          |
| headerName | 标题名                                                                                        | string  | -                                                            | -          |
| autoRotate | 收缩按钮是否自动旋转                                                                          | boolean | -                                                            | false      |
| collapsed  | 是否默认折叠（iconClass 参数存在时生效）                                                      | boolean | -                                                            | true       |
| splitLine  | 标题与内容的分割线                                                                            | boolean | -                                                            | true       |

## Control

Control 参数

| 参数      | 说明                                                                                                  | 类型   | 可选值                                                       | 默认值     |
| :-------- | :---------------------------------------------------------------------------------------------------- | :----- | :----------------------------------------------------------- | :--------- |
| position  | 控件添加到地图上的位置。添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效         | string | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left' |
| mapTarget | 关联地图容器 ID。如果该参数省略，则默认绑定其父组件为地图组件的 Map 实例或者第一个地图组件的 Map 实例 | string | -                                                            | -          |

## Layer

Layer 参数

| 参数        | 说明                                                                                                  | 类型                                                                       | 可选值 | 默认值 |
| :---------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----- | :----- |
| layerId     | 图层 ID                                                                                               | string                                                                     | -      |
| sourceId    | 图层源 ID                                                                                             | string                                                                     | -      | -      |
| sourceLayer | 矢量瓦片数据源使用的图层                                                                              | string                                                                     | -      | -      |
| minzoom     | 图层的最小缩放级别                                                                                    | number                                                                     | -      | 0      |
| maxzoom     | 图层的最大缩放级别                                                                                    | number                                                                     | -      | 22     |
| paint       | 图层 Paint 配置                                                                                       | [paint](https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-property)   | -      | -      |
| layout      | 图层 Layout 配置                                                                                      | [layout](https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-property) | -      | -      |
| filter      | 图层源特性过滤条件的表达式                                                                            | [expression](https://www.mapbox.cn/mapbox-gl-js/style-spec/#expressions)   | -      | -      |
| before      | 指定插入现有图层 ID。 如果该参数被省略，该图层将会被添加到图层数组的末尾                              | string                                                                     | -      | -      |
| mapTarget   | 关联地图容器 ID。如果该参数省略，则默认绑定其父组件为地图组件的 Map 实例或者第一个地图组件的 Map 实例 | string                                                                     | -      | -      |

## ThirdService

第三方服务参数

| 参数  | 说明                                                                            | 类型   | 可选值 | 默认值 |
| :---- | :------------------------------------------------------------------------------ | :----- | :----- | :----- |
| url   | 服务地址                                                                        | string | -      | -      |
| field | 指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string | -      | -      |
| proxy | 服务代理地址                                                                    | string | -      | -      |

## Timer

定时刷新参数

| 参数        | 说明                 | 类型    | 可选值 | 默认值 |
| :---------- | :------------------- | :------ | :----- | :----- |
| startTiming | 是否开启定时刷新     | boolean | -      | false  |
| frequency   | 请求间隔时间。单位秒 | number  | -      | 3      |
