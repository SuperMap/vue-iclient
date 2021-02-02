<script lang="ts">
import Theme from '../_mixin/Theme';
import { Swiper } from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';
import { getSlotOptions } from 'ant-design-vue/es/_util/props-util';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import { CreateElement } from 'vue';

interface swiperOptionsType {
  initialSlide: Number;
  direction: String;
  speed: Number;
  loop: Boolean;
  grabCursor: Boolean;
  mousewheel: Boolean;
  keyboard: Boolean;
  autoplay: Boolean | Object;
  effect: String;
  navigation?: Object;
  pagination?: Object;
  scrollbar?: Object;
}

@Component({
  name: 'SmSlideshow'
})
class Slideshow extends Mixins(Theme) {
  swiper: any;

  @Prop() activeIndex: number;
  @Prop({ default: 0 }) defaultActiveIndex: number;
  @Prop({ default: 'horizontal' }) direction: string;
  @Prop({ default: 300 }) speed: number;
  @Prop({ default: true }) loop: boolean;
  @Prop({ default: false }) mousewheel: boolean;
  @Prop({ default: false }) keyboard: boolean;
  @Prop() navigation: Object;
  @Prop() pagination: Object;
  @Prop() scrollbar: Object;
  @Prop({ default: false }) grabCursor: boolean;
  @Prop() autoplay: boolean | Object;
  @Prop({ default: 'slide' }) effect: string; // slide cube coverflow flip

  get swiperOptions() {
    let options: swiperOptionsType = {
      initialSlide: this.activeIndex === 0 ? this.activeIndex : this.activeIndex || this.defaultActiveIndex,
      direction: this.direction,
      speed: this.speed,
      loop: this.loop,
      grabCursor: this.grabCursor,
      mousewheel: this.mousewheel,
      keyboard: this.keyboard,
      autoplay: this.autoplay,
      effect: this.effect
    };
    this.navigation &&
      (options.navigation = { ...this.pagination, nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' });
    this.pagination && (options.pagination = { ...this.pagination, el: '.swiper-pagination' });
    this.scrollbar && (options.scrollbar = { ...this.scrollbar, el: '.swiper-scrollbar' });
    return options;
  }

  @Watch('activeIndex')
  activeIndexChanged(index: number, speed: number) {
    this.goTo(index, speed);
  }

  mounted() {
    // @ts-ignore
    this.swiper = this.$refs.mySwiper.$swiper;
  }

  _change() {
    let changeParameter = {
      progress: this.swiper.progress,
      activeIndex: this.swiper.activeIndex,
      realIndex: this.swiper.realIndex,
      previousIndex: this.swiper.previousIndex
    };
    this.$emit('change', changeParameter);
    this.$emit('input', this.swiper.activeIndex);
  }
  next(speed: number) {
    this.swiper.slideNext(speed);
  }
  prev(speed: number) {
    this.swiper.slidePrev(speed);
  }
  goTo(index: number, speed: number) {
    this.swiper.slideTo(index, speed);
  }
  autoplayStop() {
    this.autoplay && this.swiper.autoplay.stop();
  }
  autoplayStart() {
    this.autoplay && this.swiper.autoplay.start();
  }

  render(h: CreateElement) {
    let slots = [];
    let children = this.$slots['default'];
    if (children && children.length) {
      children.forEach(element => {
        if (!getSlotOptions(element).__SM_SLIDESHOW_ITEM) {
          console.error("Only accepts Slideshow.Item as Slideshow's children");
        }
      });
      slots.push(children);
    }
    this.pagination && slots.push(h('div', { class: 'swiper-pagination', slot: 'pagination' }));
    this.scrollbar && slots.push(h('div', { class: 'swiper-scrollbar', slot: 'scrollbar' }));
    if (this.navigation) {
      slots.push(h('div', { class: 'swiper-button-prev', slot: 'button-prev', style: this.getTextColorStyle }));
      slots.push(h('div', { class: 'swiper-button-next', slot: 'button-next', style: this.getTextColorStyle }));
    }
    return h(
      'div',
      {
        class: 'sm-component-slideshow',
        style: [this.collapseCardBackgroundStyle, this.getTextColorStyle],
        on: { mouseover: this.autoplayStop, mouseout: this.autoplayStart }
      },
      [
        h(
          Swiper,
          {
            props: { options: this.swiperOptions },
            on: { slideChange: this._change },
            ref: 'mySwiper'
          },
          slots
        )
      ]
    );
  }
}

export default Slideshow;
</script>
