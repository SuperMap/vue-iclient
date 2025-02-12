<script lang="ts">
import { CreateElement, VNode } from 'vue';
import { Component, Mixins, Prop, Emit, Watch } from 'vue-property-decorator';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmCollapseCard from 'vue-iclient/src/common/collapse-card/CollapseCard.vue';
import FlyToViewModel, { flyToLocationOptions } from './FlyToViewModel';

type centerParam = [number, number];

interface dataItemParams {
  location: centerParam;
  // eslint-disable-next-line
  flyOptions?: mapboxglTypes.FlyToOptions
}

interface changeDataParams {
  activeIndex: number;
}

@Component({
  name: 'SmFlyTo',
  viewModelProps: ['autoplay', 'interval', 'immediate', 'loop', 'defaultActiveIndex', 'activeIndex']
})
export default class FlyTo extends Mixins(MapGetter, Control, VmUpdater, BaseCard, Theme) {
  viewModel: FlyToViewModel;
  playStatus: boolean = false;
  currentIndex: number = null;

  // eslint-disable-next-line
  @Prop() flyOptions: mapboxglTypes.FlyToOptions;
  @Prop() data: dataItemParams[] | centerParam[];
  @Prop({ default: true }) autoplay: boolean;
  @Prop({ default: 3000 }) interval: number;
  @Prop({ default: false }) immediate: boolean;
  @Prop({ default: true }) loop: boolean;
  @Prop({ default: 0 }) defaultActiveIndex: number;
  @Prop() activeIndex: number;
  @Prop({ default: true }) showController: boolean;
  @Prop({ default: 'sm-components-icon-flyto' }) iconClass: string;
  @Prop({
    default() {
      return this.$t('flyTo.title');
    }
  })
  headerName: string;

  @Watch('data', { deep: true })
  handleDataChanged() {
    this.viewModel.setData(this.handleDataFormatted());
  }

  @Watch('currentIndex')
  handleActiveIndexChanged() {
    if (this.currentIndex === this.data.length - 1 && !this.loop && this.playStatus) {
      this.playStatus = false;
    }
  }

  @Watch('playStatus')
  handlePlayStatusChanged() {
    this.viewModel.setAutoplay(this.playStatus);
  }

  @Emit()
  change(data: changeDataParams) {
    return data;
  }

  created() {
    const options: flyToLocationOptions = {
      data: this.handleDataFormatted(),
      autoplay: this.autoplay,
      interval: this.interval,
      immediate: this.immediate,
      loop: this.loop,
      defaultActiveIndex: this.defaultActiveIndex,
      activeIndex: this.activeIndex
    };
    this.viewModel = new FlyToViewModel(options);
    this.playStatus = this.autoplay;
    this.viewModel.on('flychange', this.handleFlyChange);
  }

  // eslint-disable-next-line
  handleDataFormatted(): mapboxglTypes.FlyToOptions[] {
    if (!this.data) {
      return null;
    }
    const data: any = this.data;
    // eslint-disable-next-line
    const nextData: mapboxglTypes.FlyToOptions[] = data.map((item: centerParam | dataItemParams) => {
      if (item instanceof Array) {
        return {
          ...this.flyOptions,
          center: item
        };
      } else if (typeof item === 'object' && item.location instanceof Array) {
        const flyOptions = item.flyOptions || this.flyOptions;
        return {
          center: item.location,
          ...flyOptions
        };
      }
      return null;
    });
    return nextData;
  }

  handleFlyChange({ activeIndex }) {
    this.currentIndex = activeIndex;
    this.change({ activeIndex });
  }

  togglePlayStatus() {
    this.playStatus = !this.playStatus;
  }

  prev() {
    this.viewModel.prev();
  }

  next() {
    this.viewModel.next();
  }

  goto(index: number) {
    this.viewModel.goto(index);
  }

  render(h: CreateElement): VNode {
    if (!this.showController) {
      return null;
    }
    return h(
      SmCollapseCard,
      {
        props: {
          iconClass: this.iconClass,
          iconPosition: this.position,
          autoRotate: this.autoRotate,
          collapsed: this.collapsed,
          headerName: this.headerName,
          background: this.background,
          textColor: this.textColor
        },
        class: {
          'sm-component-fly-to': true
        },
        directives: [
          {
            name: 'show',
            value: this.isShow
          }
        ]
      },
      [
        h(
          'div',
          {
            class: {
              'sm-component-fly-to__content': true
            }
          },
          [
            h('i', {
              class: {
                'sm-components-icon-solid-triangle-left': true,
                'icon-disabled': !this.data || !this.loop && this.currentIndex === 0
              },
              style: this.subComponentSpanBgStyle,
              on: {
                click: this.prev
              }
            }),
            h('i', {
              class: {
                'sm-components-icon-bofang3': !this.playStatus,
                'sm-components-icon-zanting': this.playStatus,
                'icon-disabled': !this.data
              },
              style: this.subComponentSpanBgStyle,
              on: {
                click: this.togglePlayStatus
              }
            }),
            h('i', {
              class: {
                'sm-components-icon-solid-triangle-right': true,
                'icon-disabled': !this.data || !this.loop && this.currentIndex === this.data.length - 1
              },
              style: this.subComponentSpanBgStyle,
              on: {
                click: this.next
              }
            })
          ]
        )
      ]
    );
  }
}
</script>

<style lang="scss" scoped></style>
