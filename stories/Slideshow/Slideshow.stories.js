import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';
import mapboxgl from '../../static/libs/mapboxgl/mapbox-gl-enhance';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.slideshow.title')}`,
  id: 'BasicComponents/slideshow'
};

const attractions = [
  {
    title: '长海',
    subtitle: '则查洼沟景点-长海',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/changhai.jpg',
    coordinates: [103.93424623295097, 33.03730377719067],
    description:
      '九寨沟长海海拔3060米，长约五公里，宽约六百多米，面积达到93万平方米。旁边的山峰终年积雪，四周森林珠翠，在长海观台上看去，蓝天白云，皑皑峰雪尽收眼底，感觉山和天互相连接在一起没有距离，这也是长海的一大景观。'
  },
  {
    title: '五彩池',
    subtitle: '则查洼沟景点-五彩池',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/wucaichi.jpg',
    coordinates: [103.93303602365336, 33.04646925591396],
    description:
      '五彩池是九寨沟的精粹，是景区最小颜色最为丰富的海子，上半部呈碧蓝色，下半部呈橙红色，左边呈天蓝色，右边呈橄榄绿色。海子生长着水绵、小蕨等水生植物群落和草本植物。冬季四周冰天雪地，五彩池却不冻冰，甚为奇绝。'
  },
  {
    title: '上季节海',
    subtitle: '则查洼沟景点-上季节海',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/shangjijiehai.jpg',
    coordinates: [103.92902077067332, 33.05970589470181],
    description:
      '上季节海毗邻五彩池，湖水随季节变化，时盈时涸。秋日雨季，湖水上涨，湖色湛蓝，夏日水浅呈翠绿色，初冬以后，湖水干涸，湖床上长满青草，海子又成了放牧草滩，草滩上生长着联合国一类保护植物--若希维奇'
  },
  {
    title: '下季节海',
    subtitle: '则查洼沟景点-下季节海',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/xiajijiehai.jpg',
    coordinates: [103.91843444449766, 33.11997839989726],
    description:
      '下季节海镶嵌在花繁草茂的山坳里，水量随着季节而变化，秋季时，雨量充沛，湖水饱满，下季节海的水色最湛蓝透明，远远望去就好像是鲜蓝的墨水。冬春季节，水位渐低，一直到初夏，湖水甚至全部干涸，湖床上长满了牧草，成为放牧牛马的福地。一到电秋天，叶子转黄，远远看去满树金光。'
  },
  {
    title: '五花海',
    subtitle: '日则沟景点-五花海',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/wuhuahai.jpg',
    coordinates: [103.88099726484862, 33.159143349891465],
    description:
      '五花海，海拔2472米，水深5米，面积9万平方米，被誉为“九寨沟一绝”和“九寨精华”，在珍珠滩瀑布之上，熊猫湖的下部于日则沟孔雀河上游的尽头。五花海四周的山坡，入秋后便笼罩在一片绚丽的绝色秋色中，色彩丰富，姿态万千。'
  },
  {
    title: '珍珠滩瀑布',
    subtitle: '日则沟景点—珍珠滩瀑布',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/zhenzhutan.jpg',
    coordinates: [103.88723487431847, 33.16587890523388],
    description:
      '珍珠滩瀑布高21米，宽162米，是九寨沟内一个典型的组合景观，是电视剧《西游记》片段中，唐僧师徒牵马涉水的地方。瀑布落差最大可达40米，气势非凡，雄伟壮观。瀑布冲进谷底，卷起千堆浪花，向东狂奔而去。'
  },
  {
    title: '诺日朗瀑布',
    subtitle: '日则沟景点—诺日朗瀑布',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/nuorilang.jpg',
    coordinates: [103.90771770744831, 33.163703206300525],
    description:
      '诺日朗瀑布宽270米，高24.5米，是中国大型钙化瀑布之一，也是中国最宽的瀑布。藏语中诺日朗是伟岸高大的意思，因此诺日朗瀑布意思就是雄伟壮观的瀑布。滔滔水流自诺日朗群海而来，经瀑布流下，如银河飞泻，声震山谷。'
  },
  {
    title: '树正群海',
    subtitle: '树正沟景点-树正群海',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/shuzhengqunhai.jpg',
    coordinates: [103.89731764184347, 33.19859679345478],
    description:
      '树正群海景区是九寨沟秀丽风景的大门。树正群海沟全长13.8公里，共有各种湖泊（海子）40余个，约占九寨沟景区全部湖泊的40%。上部海子的水翻越湖堤，从树丛中溢出，激起白色的水花，在青翠中跳跳蹦蹦，穿梭奔窜。'
  },
  {
    title: '芦苇海',
    subtitle: '树正沟景点-芦苇海',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/luweihai.jpg',
    coordinates: [103.9181730938379, 33.23129463237716],
    description:
      '芦苇海海拔2140米，全长2.2公里，是一个半沼泽湖泊。海中芦苇丛生，水鸟飞翔，清溪碧流，漾绿摇翠，蜿蜒空行，好一派泽国风光。芦苇海中，荡荡芦苇，一片青葱，微风徐来，绿浪起伏。飒飒之声，委婉抒情，使人心旷神怡。'
  },
  {
    title: '扎如寺',
    subtitle: '扎如沟景点-扎如寺',
    image: 'https://iclient.supermap.io/examples/data/jiuzhai/zharusi.jpg',
    coordinates: [103.93169934861643, 33.25624201104978],
    description:
      '扎如寺坐落于扎如沟宝镜岩下，是九寨沟最大的雍仲苯教寺庙，距今已有一千年的历史，藏语全称叫“热悟贡扎西彭措林”（圣地吉祥圆满洲）。扎如寺由大殿、藏经楼、吉祥多门塔等组成，是一座具有浓厚藏族寺庙色彩的建筑。'
  }
];

export const slideshow = () => ({
  mixins: [theme],
  data() {
    return {
      activeIndex: 0,
      mapOptions: {
        zoom: 14,
        pitch: 60,
        center: attractions[0].coordinates
      },
      content: attractions
    };
  },
  beforeDestroy() {
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    slideChange(options) {
      this.marker && this.marker.remove() && (this.marker = null);
      let coordinates = attractions[options.realIndex].coordinates;
      this.$refs.map.map.flyTo({ center: coordinates });
      this.marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(this.$refs.map.map);
    }
  },
  template: `
  <div>
    <sm-web-map
      :mapOptions="mapOptions"
      ref="map"
      mapId='567946816'
      style="height:700px;"
      serverUrl='https://www.supermapol.com'
      tianditu-key='1d109683f4d84198e37a38c442d68311'
    >
    </sm-web-map>
    <sm-slideshow
      v-model="activeIndex"
      :collapsed="false"
      style="position: absolute; top: 40px; left: 30px; width: 352px; height: 427px; border-radius: 4px;"
      :autoplay="{delay: 4000}"
      v-on:change="slideChange"
    >
      <sm-slideshow-item v-for="item of content" :key="item.title">
        <h3 style="font-size: 19px;margin: 3px 0 0 5px">{{ item.title }}</h3>
        <p style="padding: 10px 16px 0;font-size: 16px;text-align: left;text-indent:2em;">{{ item.description }}</p>
        <img :src="item.image" style="width: 261px; height: 147px; margin-top: 7px" />
      </sm-slideshow-item>
    </sm-slideshow>
  </div>
`
});
slideshow.story = {
  name: toI18n('basicComponent.basic')
};

export const effectSlideshow = () => ({
  mixins: [theme],
  data() {
    return {
      activeIndex: 0,
      mapOptions: {
        zoom: 14,
        pitch: 60,
        center: attractions[0].coordinates
      },
      content: attractions,
      effect: 'cube'
    };
  },
  beforeDestroy() {
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    slideChange(options) {
      this.marker && this.marker.remove() && (this.marker = null);
      let coordinates = attractions[options.realIndex].coordinates;
      this.$refs.map.map.flyTo({ center: coordinates });
      this.marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(this.$refs.map.map);
    }
  },
  template: `
  <div>
    <sm-web-map
      :mapOptions="mapOptions"
      target="map1"
      ref="map"
      mapId='567946816'
      style="height:700px;"
      serverUrl='https://www.supermapol.com'
      tianditu-key='1d109683f4d84198e37a38c442d68311'
    >
    </sm-web-map>
    <sm-slideshow
      v-model="activeIndex"
      :collapsed="false"
      style="position: absolute; top: 40px; left: 30px; width: 352px; height: 427px; border-radius: 4px;"
      :autoplay="{delay: 4000}"
      :effect="effect"
      v-on:change="slideChange"
    >
      <sm-slideshow-item v-for="item of content" :key="item.title">
        <h3 style="font-size: 19px;margin: 3px 0 0 5px">{{ item.title }}</h3>
        <p style="padding: 10px 16px 0;font-size: 16px;text-align: left;text-indent:2em;">{{ item.description }}</p>
        <img :src="item.image" style="width: 261px; height: 147px; margin-top: 7px" />
      </sm-slideshow-item>
    </sm-slideshow>
  </div>
`
});
effectSlideshow.story = {
  name: toI18n('basicComponent.slideshow.switchEffect')
};

export const verticalSlideshow = () => ({
  mixins: [theme],
  data() {
    return {
      activeIndex: 0,
      mapOptions: {
        zoom: 14,
        pitch: 60,
        center: attractions[0].coordinates
      },
      content: attractions
    };
  },
  beforeDestroy() {
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    slideChange(options) {
      this.marker && this.marker.remove() && (this.marker = null);
      let coordinates = attractions[options.realIndex].coordinates;
      this.$refs.map.map.flyTo({ center: coordinates });
      this.marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(this.$refs.map.map);
    }
  },
  template: `
  <div>
    <sm-web-map
      :mapOptions="mapOptions"
      target="map2"
      ref="map"
      mapId='567946816'
      style="height:700px;"
      serverUrl='https://www.supermapol.com'
      tianditu-key='1d109683f4d84198e37a38c442d68311'
    >
    </sm-web-map>
    <sm-slideshow
      v-model="activeIndex"
      :collapsed="false"
      style="position: absolute; top: 40px; left: 30px; width: 352px; height: 427px; border-radius: 4px;"
      :autoplay="{delay: 4000}"
      direction="vertical"
      v-on:change="slideChange"
    >
      <sm-slideshow-item v-for="item of content" :key="item.title">
        <h3 style="font-size: 19px;margin: 3px 0 0 5px">{{ item.title }}</h3>
        <p style="padding: 10px 16px 0;font-size: 16px;text-align: left;text-indent:2em;">{{ item.description }}</p>
        <img :src="item.image" style="width: 261px; height: 147px; margin-top: 7px" />
      </sm-slideshow-item>
    </sm-slideshow>
  </div>
`
});
verticalSlideshow.story = {
  name: toI18n('basicComponent.slideshow.vertical')
};

export const navigationSlideshow = () => ({
  mixins: [theme],
  data() {
    return {
      activeIndex: 0,
      mapOptions: {
        zoom: 14,
        pitch: 60,
        center: attractions[0].coordinates
      },
      navigation: {
        hideOnClick: true
      },
      content: attractions
    };
  },
  mounted() {
    const prevBtn = document.querySelector('.swiper-button-prev');
    const nextBtn = document.querySelector('.swiper-button-next');
    prevBtn.style.top = '70%';
    nextBtn.style.top = '70%';
  },
  beforeDestroy() {
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    slideChange(options) {
      this.marker && this.marker.remove() && (this.marker = null);
      let coordinates = attractions[options.realIndex].coordinates;
      this.$refs.map.map.flyTo({ center: coordinates });
      this.marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(this.$refs.map.map);
    }
  },
  template: `
  <div>
    <sm-web-map
      :mapOptions="mapOptions"
      target="map3"
      ref="map"
      mapId='567946816'
      style="height:700px;"
      serverUrl='https://www.supermapol.com'
      tianditu-key='1d109683f4d84198e37a38c442d68311'
    >
    </sm-web-map>
    <sm-slideshow
      v-model="activeIndex"
      :collapsed="false"
      style="position: absolute; top: 40px; left: 30px; width: 352px; height: 427px; border-radius: 4px;"
      :autoplay="{delay: 4000}"
      :navigation="navigation"
      v-on:change="slideChange"
    >
      <sm-slideshow-item v-for="item of content" :key="item.title">
        <h3 style="font-size: 19px;margin: 3px 0 0 5px">{{ item.title }}</h3>
        <p style="padding: 10px 16px 0;font-size: 16px;text-align: left;text-indent:2em;">{{ item.description }}</p>
        <img :src="item.image" style="width: 261px; height: 147px; margin-top: 7px" />
      </sm-slideshow-item>
    </sm-slideshow>
  </div>
`
});
navigationSlideshow.story = {
  name: toI18n('basicComponent.slideshow.navigationButtons')
};

export const paginationSlideshow = () => ({
  mixins: [theme],
  data() {
    return {
      activeIndex: 0,
      mapOptions: {
        zoom: 14,
        pitch: 60,
        center: attractions[0].coordinates
      },
      pagination: {
        type: 'bullets',
        clickable: true
      },
      content: attractions
    };
  },
  beforeDestroy() {
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    slideChange(options) {
      this.marker && this.marker.remove() && (this.marker = null);
      let coordinates = attractions[options.realIndex].coordinates;
      this.$refs.map.map.flyTo({ center: coordinates });
      this.marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(this.$refs.map.map);
    }
  },
  template: `
  <div>
    <sm-web-map
      :mapOptions="mapOptions"
      target="map4"
      ref="map"
      mapId='567946816'
      style="height:700px;"
      serverUrl='https://www.supermapol.com'
      tianditu-key='1d109683f4d84198e37a38c442d68311'
    >
    </sm-web-map>
    <sm-slideshow
      v-model="activeIndex"
      :collapsed="false"
      style="position: absolute; top: 40px; left: 30px; width: 352px; height: 427px; border-radius: 4px;"
      :autoplay="{delay: 4000}"
      :pagination="pagination"
      v-on:change="slideChange"
    >
      <sm-slideshow-item v-for="item of content" :key="item.title">
        <h3 style="font-size: 19px;margin: 3px 0 0 5px">{{ item.title }}</h3>
        <p style="padding: 10px 16px 0;font-size: 16px;text-align: left;text-indent:2em;">{{ item.description }}</p>
        <img :src="item.image" style="width: 261px; height: 147px; margin-top: 7px" />
      </sm-slideshow-item>
    </sm-slideshow>
  </div>
`
});
paginationSlideshow.story = {
  name: toI18n('basicComponent.slideshow.pagination')
};

export const scrollbarSlideshow = () => ({
  mixins: [theme],
  data() {
    return {
      activeIndex: 0,
      mapOptions: {
        zoom: 14,
        pitch: 60,
        center: attractions[0].coordinates
      },
      scrollbar: {
        draggable: true
      },
      content: attractions
    };
  },
  beforeDestroy() {
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    slideChange(options) {
      this.marker && this.marker.remove() && (this.marker = null);
      let coordinates = attractions[options.realIndex].coordinates;
      this.$refs.map.map.flyTo({ center: coordinates });
      this.marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(this.$refs.map.map);
    }
  },
  template: `
  <div>
    <sm-web-map
      :mapOptions="mapOptions"
      target="map6"
      ref="map"
      mapId='567946816'
      style="height:700px;"
      serverUrl='https://www.supermapol.com'
      tianditu-key='1d109683f4d84198e37a38c442d68311'
    >
    </sm-web-map>
    <sm-slideshow
      v-model="activeIndex"
      :collapsed="false"
      style="position: absolute; top: 40px; left: 30px; width: 352px; height: 427px; border-radius: 4px;"
      :autoplay="{delay: 4000}"
      direction="vertical"
      :scrollbar="scrollbar"
      v-on:change="slideChange"
    >
      <sm-slideshow-item v-for="item of content" :key="item.title">
        <h3 style="font-size: 19px;margin: 3px 0 0 5px">{{ item.title }}</h3>
        <p style="padding: 10px 16px 0;font-size: 16px;text-align: left;text-indent:2em;">{{ item.description }}</p>
        <img :src="item.image" style="width: 261px; height: 147px; margin-top: 7px" />
      </sm-slideshow-item>
    </sm-slideshow>
  </div>
`
});
scrollbarSlideshow.story = {
  name: toI18n('basicComponent.slideshow.scrollbar')
};
