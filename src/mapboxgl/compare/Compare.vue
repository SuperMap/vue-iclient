<script lang="ts">
import Vue, { VNode } from 'vue';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import Theme from '../../common/_mixin/Theme';
import CompareViewModel, { mapType, orientationTypes, compareOptions } from './CompareViewModel';
import debounce from 'lodash/debounce';
import { addListener, removeListener } from 'resize-detector';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';

interface loadParams {
  map: mapType;
}

interface swipeStyle {
  backgroundColor?: string;
  color?: string;
  width?: string;
  height?: string;
  borderWidth?: string;
}

@Component({
  name: 'SmCompare'
})
class Compare extends Mixins(Theme) {
  viewModel: CompareViewModel;
  beforeMapInstance: mapType;
  afterMapInstance: mapType;
  resizeHandler: any;

  @Prop({ default: 'comparison-container' }) target: string;
  @Prop({ default: 'vertical' }) orientation: orientationTypes;
  @Prop({ default: false }) mousemove: boolean;
  @Prop() beforeMapOptions: any;
  @Prop() afterMapOptions: any;
  @Prop({ default: 2 }) lineSize: number;
  @Prop({ default: 60 }) slideSize: number;
  @Prop() slideBackground: string;
  @Prop({ default: true }) autoresize: boolean;

  get additionalOptions() {
    return {
      orientation: this.orientation,
      mousemove: this.mousemove
    };
  }

  get compareSwipeLineStyle(): swipeStyle {
    const style: swipeStyle = {
      backgroundColor: this.textColor
    };
    let sizeFieldName = 'width';
    if (this.orientation === 'horizontal') {
      sizeFieldName = 'height';
    }
    style[sizeFieldName] = `${this.lineSize}px`;
    return style;
  }

  get compareSwipeSlideStyle(): swipeStyle {
    return {
      backgroundColor: this.slideBackground,
      color: this.textColor,
      width: `${this.slideSize}px`,
      height: `${this.slideSize}px`,
      borderWidth: `${this.lineSize}px`
    };
  }

  @Watch('additionalOptions')
  additionalOptionsWatcher() {
    this.handleOptionsChange();
  }

  @Watch('compareSwipeLineStyle')
  compareSwipeLineStyleWatcher(next, prev) {
    const style = this.diffStyle(next, prev);
    style && this.setSwipeLineStyle();
  }

  @Watch('compareSwipeSlideStyle')
  compareSwipeSlideStyleWatcher(next, prev) {
    const style = this.diffStyle(next, prev);
    style && this.setSwipeStyle(style);
  }

  created() {
    this.viewModel = new CompareViewModel();
  }

  mounted() {
    this.$on('theme-style-changed', this.handleThemeStyleChanged);
    if (this.autoresize) {
      this.resizeHandler = debounce(this.resize, 300, { leading: true });
      // @ts-ignore
      addListener(this.$el, this.resizeHandler);
    }
  }

  beforeDestroy() {
    this.viewModel.removed();
    if (this.autoresize) {
      // @ts-ignore
      removeListener(this.$el, this.resizeHandler);
    }
  }

  initSwipeStyle() {
    this.setSwipeLineStyle();
    this.setSwipeStyle();
  }

  resize() {
    this.handleOptionsChange();
  }

  diffStyle(nextStyle: swipeStyle, prevStyle: swipeStyle): swipeStyle {
    let diff;
    for (let key in nextStyle) {
      if (nextStyle[key] !== prevStyle[key]) {
        diff = diff || {};
        diff[key] = nextStyle[key];
      }
    }
    return diff;
  }

  setSwipeStyle(style: swipeStyle = this.compareSwipeSlideStyle): void {
    const swipeDom: HTMLElement = this.$el.querySelector('.mapboxgl-compare > div');
    this.setStyle(swipeDom, style);
  }

  setSwipeLineStyle(style: swipeStyle = this.compareSwipeLineStyle): void {
    const swipeLineDom: HTMLElement = this.$el.querySelector('.mapboxgl-compare');
    this.setStyle(swipeLineDom, style);
  }

  setStyle(dom: HTMLElement, style: swipeStyle): void {
    if (dom) {
      for (let key in style) {
        const value = style[key];
        dom.style[key] = value;
      }
    }
  }

  handleThemeStyleChanged() {
    this.setSwipeStyle({ backgroundColor: this.colorGroupsData && this.colorGroupsData[0] });
  }

  handleOptionsChange(): void {
    const options: compareOptions = {
      beforeMap: this.beforeMapInstance,
      afterMap: this.afterMapInstance,
      target: this.target,
      options: {
        orientation: this.orientation,
        mousemove: this.mousemove
      }
    };
    if (options.beforeMap && options.afterMap) {
      const beforeZoom = options.beforeMap.getZoom();
      const beforeCenter = options.beforeMap.getCenter();
      const beforeBearing = options.beforeMap.getBearing();
      const beforePitch = options.beforeMap.getPitch();
      if (beforeZoom !== options.afterMap.getZoom()) {
        options.afterMap.setZoom(beforeZoom);
      }
      if (beforeCenter.toString() !== options.afterMap.getCenter().toString()) {
        options.afterMap.setCenter(beforeCenter);
      }
      if (beforeBearing !== options.afterMap.getBearing()) {
        options.afterMap.setBearing(beforeBearing);
      }
      if (beforePitch !== options.afterMap.getPitch()) {
        options.afterMap.setPitch(beforePitch);
      }
      this.viewModel.init(options);
      this.$nextTick(this.initSwipeStyle);
    }
  }

  setBeforeMap(params: loadParams): void {
    this.beforeMapInstance = params.map;
    this.handleOptionsChange();
  }

  setAfterMap(params: loadParams): void {
    this.afterMapInstance = params.map;
    this.handleOptionsChange();
  }

  render(h): VNode {
    let children;
    if (this.beforeMapOptions && this.afterMapOptions) {
      children = [
        h(Vue.component('SmWebMap'), {
          props: this.beforeMapOptions,
          on: {
            load: this.setBeforeMap
          }
        }),
        h(Vue.component('SmWebMap'), {
          props: this.afterMapOptions,
          on: {
            load: this.setAfterMap
          }
        })
      ];
    } else if (this.$slots.beforeMap && this.$slots.afterMap) {
      const beforePrevListeners = this.$slots.beforeMap[0].componentOptions.listeners;
      this.$slots.beforeMap[0].componentOptions.listeners = Object.assign({}, beforePrevListeners, {
        load: this.setBeforeMap
      });
      const afterPrevListeners = this.$slots.afterMap[0].componentOptions.listeners;
      this.$slots.afterMap[0].componentOptions.listeners = Object.assign({}, afterPrevListeners, {
        load: this.setAfterMap
      });
      children = [this.$slots.beforeMap, this.$slots.afterMap];
    }
    return h(
      'div',
      {
        class: 'sm-component-compare',
        attrs: {
          id: this.target
        }
      },
      children
    );
  }
}

export default Compare;
</script>
