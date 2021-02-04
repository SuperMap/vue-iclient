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

| 参数                 | 说明                                                                                | 类型                | 可选值                                        | 默认值            |
| :------------------- | :---------------------------------------------------------------------------------- | :---------------- | :-------------------------------------------- | :--------------- |
| activeIndex(v-model) | 当前播放幻灯片的索引                                                                 | number           | -                                             | -                |
| defaultActiveIndex   | 初始化播放幻灯片的索引                                                               | number           | -                                             | 0                |
| direction            | 幻灯片播放方向                                                                       | string           | 'horizontal' \| 'vertical'                    | 'horizontal'     |
| loop                 | 是否开启循环播放                                                                     | boolean          | -                                             | true             |
| speed                | 播放速度，即幻灯片自动播放开始到结束的时间（单位ms），也是触摸滑动时释放至贴合的时间。  | number           | -                                             | 300              |
| autoplay             | 是否自动播放。参照[swiper](https://www.swiper.com.cn/api/autoplay/16.html)           | boolean \|  object           | -                                             | -                |
| mousewheel           | 是否开启鼠标滚轮控制播放                                                              | boolean          | -                                             | false            |
| keyboard             | 是否开启键盘控制播放                                                                 | boolean          | -                                             | false            |
| grabCursor           | 鼠标覆盖时指针会变成手掌形状，拖动时指针会变成抓手形状                                 | boolean          | -                                             | true             |
| navigation           | 前进后退按钮参数。参照[swiper](https://www.swiper.com.cn/api/navigation/355.html)     | object           | -                                             | -                |
| pagination           | 分页器导航参数。参照[swiper](https://www.swiper.com.cn/api/pagination/362.html)       | object           | -                                             | -                |
| scrollbar            | 滚动条参数。参照[swiper](https://www.swiper.com.cn/api/scrollbar/369.html)            | object           | -                                             | -                |
| effect               | 幻灯片播放效果                                                                        | string           | 'slide' \| 'cube' \| 'coverflow' \| 'flip'    | 'slide'          |

### Events

| 参数      | 说明                                         | 回调参数               |
| :-------- | :------------------------------------------- | :-------------------   |
| change    | 更改当前活动幻灯片时将触发事件                 | function(options)      |

### Methods

| 名称                    | 描述                                                                  | 
| :---------------------- | :-------------------------------------------------------------------- | 
| goTo(index, speed)      | 播放到指定幻灯片( index: 幻灯片的索引; speed: 过度持续时间)             | 
| next(speed)             | 播放到下一幻灯片( speed: 过度持续时间)                                  | 
| prev(speed)             | 播放到上一幻灯片( speed: 过度持续时间)                                  | 
