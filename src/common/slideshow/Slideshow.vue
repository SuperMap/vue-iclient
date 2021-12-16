<script lang="ts">
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import { Swiper } from 'vue-awesome-swiper';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import 'swiper/css/swiper.css';
import { getSlotOptions, filterEmpty } from 'ant-design-vue/es/_util/props-util';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import { CreateElement } from 'vue';
import isequal from 'lodash.isequal';
import debounce from 'lodash.debounce';
import { addListener, removeListener } from 'resize-detector';

interface swiperOptionsType {
  initialSlide: Number;
  direction: String;
  speed: Number;
  loopedSlides: Number;
  loop: Boolean;
  grabCursor: Boolean;
  mousewheel: Boolean;
  keyboard: Boolean;
  autoplay: Boolean | Object;
  effect: String;
  navigation?: Object;
  pagination?: Object;
  scrollbar?: Object;
  observer: Boolean;
  observeParents: Boolean;
  observeSlideChildren: Boolean;
}

@Component({
  name: 'SmSlideshow',
  model: {
    prop: 'activeIndex',
    event: 'indexChange'
  }
})
class Slideshow extends Mixins(Theme, BaseCard) {
  __resizeHandler: Function;
  swiper: any;
  isRefresh: boolean = true;
  childrenLength: number = 0;
  manualUpdateProps: string[] = [
    'speed',
    'loop',
    'grabCursor',
    'scrollbar',
    'effect',
    'navigation',
    'pagination',
    'autoplay',
    'direction'
  ];

  // 当 loop 为 true && effect 为 cube, 幻灯片页数等于3会出现重叠。
  loopedSlides: number = 3;

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
  @Prop({ default: true }) grabCursor: boolean;
  @Prop() autoplay: boolean | Object;
  @Prop({ default: true }) autoresize: boolean;
  @Prop({ default: 'slide' }) effect: string; // slide cube coverflow flip
  @Prop({ default: 'sm-components-icon-swipe' }) iconClass: string;
  @Prop({
    default() {
      return this.$t('slideshow.title');
    }
  })
  headerName: string;

  get autoplayParameter() {
    if (typeof this.autoplay === 'object') {
      return { ...this.autoplay, disableOnInteraction: false };
    } else {
      return this.autoplay;
    }
  }

  get swiperOptions() {
    let options: swiperOptionsType = {
      initialSlide: this.defaultActiveIndex,
      direction: this.direction,
      speed: this.speed,
      loop: this.loop,
      loopedSlides: this.loopedSlides,
      grabCursor: this.grabCursor,
      mousewheel: this.mousewheel,
      keyboard: this.keyboard,
      autoplay: this.autoplayParameter,
      effect: this.effect,
      observer: true,
      observeParents: true,
      observeSlideChildren: true
    };
    this.navigation && (options.navigation = this.navigation);
    this.pagination && (options.pagination = this.pagination);
    this.scrollbar && (options.scrollbar = this.scrollbar);
    return options;
  }

  @Watch('activeIndex')
  activeIndexChanged(newIndex: number, oldIndex: number) {
    if (newIndex > this.childrenLength - 1 || oldIndex > this.childrenLength - 1) {
      console.error('ActiveIndex is greater than the total number of slides');
      return;
    }
    this._activeIndexChangedHandler(newIndex, oldIndex);
  }

  @Watch('mousewheel')
  mousewheelChanged(mousewheel) {
    mousewheel ? this.swiper.mousewheel.enable() : this.swiper.mousewheel.disable();
  }

  @Watch('keyboard')
  keyboardChanged(keyboard) {
    keyboard ? this.swiper.keyboard.enable() : this.swiper.keyboard.disable();
  }

  @Watch('autoresize')
  autoResizeChanged() {
    this.autoResizeHandler();
  }

  mounted() {
    // @ts-ignore
    this.swiper = this.$refs.mySwiper.$swiper;
    this.watchOptions();
    this.autoResizeHandler();
  }

  beforeDestroy() {
    // @ts-ignore
    removeListener(this.$el, this.__resizeHandler);
  }

  slideChange() {
    let changeParameter = {
      progress: this.swiper.progress,
      activeIndex: this.swiper.activeIndex,
      realIndex: this.swiper.realIndex,
      previousIndex: this.swiper.previousIndex
    };
    this.$emit('change', changeParameter);
    this.$emit('indexChange', this.swiper.realIndex);
  }

  _activeIndexChangedHandler(newIndex: number, oldIndex: number) {
    if (this.loop) {
      const changeType = this._getChangeType(newIndex, oldIndex, this.childrenLength);
      if (['next', 'loopToFirst'].includes(changeType)) {
        this.next();
        return;
      }
      if (['prev', 'loopToLast'].includes(changeType)) {
        this.prev();
        return;
      }
    }
    this.goTo(newIndex, 300);
  }

  _getChangeType(newIndex, oldIndex, size) {
    const offset = newIndex - oldIndex;
    if (offset === 1) {
      return 'next';
    }
    if (offset === -1) {
      return 'prev';
    }
    if (oldIndex === size - 1 && newIndex === 0) {
      return 'loopToFirst';
    }
    if (oldIndex === 0 && newIndex === size - 1) {
      return 'loopToLast';
    }
    return 'jump';
  }

  _observerUpdate(swiper) {
    if (swiper.type === 'childList') {
      this.goTo(this.swiper.realIndex, 300);
    }
  }

  _reload() {
    this.isRefresh = false;
    this.$nextTick(() => {
      this.isRefresh = true;
      this.$nextTick(() => {
        // @ts-ignore
        this.swiper = this.$refs.mySwiper.$swiper;
      });
    });
  }

  next(speed?: number) {
    this.swiper.slideNext(speed);
  }

  prev(speed?: number) {
    this.swiper.slidePrev(speed);
  }

  goTo(index: number, speed?: number) {
    if (this.swiper) {
      this.loop ? this.swiper.slideToLoop(index, speed) : this.swiper.slideTo(index, speed);
    }
  }

  autoplayStop() {
    this.autoplay && this.swiper.autoplay.stop();
  }

  autoplayStart() {
    this.autoplay && this.swiper.autoplay.start();
  }

  resize() {
    this.swiper && this.swiper.update(true);
  }

  watchOptions() {
    this.manualUpdateProps.map(item => {
      this.$watch(
        item,
        function (newVal, oldVal) {
          if (!isequal(newVal, oldVal)) {
            this._reload();
          }
        },
        { deep: true }
      );
    });
  }

  autoResizeHandler() {
    if (this.autoresize) {
      this.__resizeHandler = debounce(
        () => {
          this.resize();
        },
        100,
        { leading: true }
      );
      // @ts-ignore
      addListener(this.$el, this.__resizeHandler);
    }
  }

  handlerNamedSlot(alias: string, h: CreateElement) {
    const existSlots = !!this.$slots[alias];
    return h(
      existSlots ? 'template' : 'div',
      { class: `swiper-${alias}`, slot: alias },
      existSlots ? this.$slots[alias] : ''
    );
  }

  render(h: CreateElement) {
    let slots = [];
    let children = filterEmpty(this.$slots.default);
    this.childrenLength = children.length;
    if (children && this.childrenLength) {
      children.forEach(element => {
        if (getSlotOptions(element).__SM_SLIDESHOW_ITEM) {
          slots.push(element);
        } else {
          console.error("Only accepts Slideshow.Item as Slideshow's children");
        }
      });
    }
    this.pagination && slots.push(this.handlerNamedSlot('pagination', h));
    this.scrollbar && slots.push(this.handlerNamedSlot('scrollbar', h));
    if (this.navigation) {
      slots.push(this.handlerNamedSlot('button-prev', h), this.handlerNamedSlot('button-next', h));
    }
    let collapseCardProps = {
      iconClass: this.iconClass,
      iconPosition: this.position,
      headerName: this.headerName,
      autoRotate: this.autoRotate,
      collapsed: this.collapsed,
      background: this.background,
      textColor: this.textColor,
      splitLine: this.splitLine
    };
    return h(
      'sm-collapse-card',
      {
        class: 'sm-component-slideshow',
        props: collapseCardProps
      },
      [
        h(
          'div',
          {
            class: 'sm-component-slideshow__content',
            on: { mouseover: this.autoplayStop, mouseout: this.autoplayStart }
          },
          [
            this.isRefresh
              ? h(
                Swiper,
                {
                  domProps: { realIndex: this.activeIndex },
                  props: { options: this.swiperOptions },
                  on: {
                    slideChange: this.slideChange,
                    observerUpdate: this._observerUpdate
                  },
                  ref: 'mySwiper'
                },
                slots
              )
              : null
          ]
        )
      ]
    );
  }
}

export default Slideshow;
</script>
