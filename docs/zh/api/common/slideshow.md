# 幻灯片

<sm-iframe src="https://iclient.supermap.io/examples/component/components_slideshow_vue.html"></sm-iframe>

```vue
<sm-slideshow :activeIndex="2">
  <sm-slideshow-item v-for="item of 10" :key="item">
    <h1>{{ item }}</h1>
  </sm-slideshow-item>
</sm-slideshow>
```

### Attributes

| 参数                 | 说明                                                                              | 类型                                                                                                                                              | 可选值                                     | 默认值       |
| :------------------- | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------- | :----------- |
| activeIndex(v-model) | 当前播放幻灯片的索引                                                              | number                                                                                                                                            | -                                          | -            |
| defaultActiveIndex   | 首次播放幻灯片的索引                                                              | number                                                                                                                                            | -                                          | 0            |
| direction            | 幻灯片播放方向                                                                    | string                                                                                                                                            | 'horizontal' \| 'vertical'                 | 'horizontal' |
| loop                 | 是否开启循环播放                                                                  | boolean                                                                                                                                           | -                                          | true         |
| speed                | 播放速度。幻灯片自动播放开始到结束的时间或触摸滑动时释放至贴合的时间。单位毫秒    | number                                                                                                                                            | -                                          | 300          |
| autoplay             | 是否自动播放。参照[swiper](https://www.swiper.com.cn/api/autoplay/16.html)        | boolean \| object                                                                                                                                 | -                                          | -            |
| mousewheel           | 是否开启鼠标滚轮控制播放                                                          | boolean                                                                                                                                           | -                                          | false        |
| keyboard             | 是否开启键盘控制播放                                                              | boolean                                                                                                                                           | -                                          | false        |
| grabCursor           | 是否开启鼠标手掌形状。在 hover 状态或拖动时触发                                   | boolean                                                                                                                                           | -                                          | true         |
| navigation           | 前进后退按钮配置。参照[swiper](https://www.swiper.com.cn/api/navigation/355.html) | object \| [slot](https://github.com/surmon-china/surmon-china.github.io/blob/source/examples/vue-awesome-swiper/33-thumbs-gallery.vue)   | -                                          | -            |
| pagination           | 分页器导航配置。参照[swiper](https://www.swiper.com.cn/api/pagination/362.html)   | object \| [slot](https://github.com/surmon-china/surmon-china.github.io/blob/source/examples/vue-awesome-swiper/15-centered-auto.vue)    | -                                          | -            |
| scrollbar            | 滚动条配置。参照[swiper](https://www.swiper.com.cn/api/scrollbar/369.html)        | object \| [slot](https://github.com/surmon-china/surmon-china.github.io/blob/source/examples/vue-awesome-swiper/17-scroll-container.vue) | -                                          | -            |
| effect               | 幻灯片播放效果                                                                    | string                                                                                                                                            | 'slide' \| 'cube' \| 'coverflow' \| 'flip' | 'slide'      |
| autoresize           | 组件根元素尺寸变化时幻灯片是否自适应                                              | boolean                                                                                                                                           | -                                          | true         |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)

### Events

| 参数   | 说明                           | 回调参数          |
| :----- | :----------------------------- | :---------------- |
| change | 更改当前活动幻灯片时将触发事件 | function(options) |

### Methods

| 名称               | 描述                                                        |
| :----------------- | :---------------------------------------------------------- |
| goTo(index, speed) | 播放到指定幻灯片( index: 幻灯片的索引; speed: 过度持续时间) |
| next(speed)        | 播放到下一幻灯片( speed: 过度持续时间)                      |
| prev(speed)        | 播放到上一幻灯片( speed: 过度持续时间)                      |
