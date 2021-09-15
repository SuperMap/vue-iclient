<template>
  <div class="sm-component-time-line" :style="[getBackgroundStyle]">
    <v-chart
      :id="chartId"
      :ref="chartId"
      :options="options"
      :autoresize="true"
      :style="{ width: '100%', height: '100%' }"
      @timelinechanged="timelineChange"
      @timelineplaychanged="timelineplaychanged"
    />
  </div>
</template>

<script lang='ts'>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import ECharts from 'vue-echarts';
import { Component, Prop, Mixins, Emit } from 'vue-property-decorator';
import UniqueId from 'lodash.uniqueid';

const ThemeStyleName = [
  'primaryColor',
  'avatarBackground',
  'hoverColor',
  'tooltipColor',
  'tooltipBackground',
  'shadowColor',
  'sliderRailBackgroundColor'
];
@Component({
  name: 'SmTimeLine',
  components: {
    'v-chart': ECharts
  }
})
export default class SmTimeLine extends Mixins(Theme) {
  chartId = UniqueId(`TimeLine-`);
  timer: any = null;
  playState: boolean = false;
  hoverColor: string = '#e5666f';
  tooltipColor: string = 'rgba(255, 255, 255, 0.85)';
  primaryColor: string = '#e14d57';
  avatarBackground: string = '#fff';
  tooltipBackground: string = '#535353';
  shadowColor: string = 'rgba(0, 0, 0, 0.35)';
  sliderRailBackgroundColor: string = 'rgba(255, 255, 255, 0.25)';
  themeStyleName: string[] = ThemeStyleName;

  @Prop({ default: false }) autoPlay: boolean;
  @Prop({ default: true }) loop: boolean;
  @Prop({ default: 3000 }) playInterval: string | number;
  @Prop({ default: 0 }) currentIndex: number;
  @Prop({
    default() {
      return [];
    }
  })
  data: Array<any>;

  @Prop({
    default() {
      return {};
    }
  })
  label: Object;

  @Prop({
    default() {
      return {};
    }
  })
  lineStyle: Object;

  @Prop({
    default() {
      return {};
    }
  })
  itemStyle: Object;

  @Prop({
    default() {
      return { label: {} };
    }
  })
  emphasis: Object;

  @Prop({
    default() {
      return {};
    }
  })
  checkpointStyle: Object;

  @Prop({
    default() {
      return {};
    }
  })
  controlStyle: Object;

  @Prop() nextEnable: boolean | null;

  get color() {
    return this.getColor(0);
  }

  get options() {
    let options = {
      baseOption: {
        timeline: {
          axisType: 'category',
          autoPlay: this.autoPlay,
          playInterval: this.playInterval,
          data: this.data,
          currentIndex: this.currentIndex,
          label: {
            color: this.getTextColor,
            fontSize: 12,
            position: 15,
            ...this.label
          },
          lineStyle: Object.assign({ color: this.sliderRailBackgroundColor }, this.lineStyle),
          itemStyle: Object.assign(
            {
              itemSize: 13,
              // @ts-ignore
              color: (this.checkpointStyle && this.checkpointStyle.borderColor) || this.avatarBackground,
              // @ts-ignore
              borderColor: (this.checkpointStyle && this.checkpointStyle.color) || this.primaryColor,
              borderWidth: 2
            },
            this.itemStyle
          ),
          controlStyle: Object.assign(
            {
              itemSize: 19,
              itemGap: 10,
              color: this.primaryColor,
              borderColor: this.primaryColor,
              borderWidth: 0,
              opacity: 1,
              shadowBlur: 0,
              prevIcon:
                'M16.9695,5.115 L16.9695,3.306 C16.9692323,3.23442582 16.9282399,3.16924789 16.8638436,3.13800611 C16.7994472,3.10676433 16.7228823,3.11490949 16.6665,3.159 L6.1005,11.409 C5.91865188,11.5505304 5.81230143,11.7680665 5.81230143,11.9985 C5.81230143,12.2289335 5.91865188,12.4464696 6.1005,12.588 L16.6665,20.841 C16.7228012,20.8856152 16.7997611,20.8938213 16.864204,20.8620808 C16.9286469,20.8303403 16.9690514,20.7643278 16.968,20.6925 L16.968,18.882 C16.9677279,18.7669965 16.9153205,18.6583202 16.8255,18.5865 L8.388,12 L16.8255,5.412 C16.9153205,5.34017977 16.9677279,5.23150348 16.968,5.1165 L16.9695,5.115 Z',
              nextIcon:
                'M172.373333 120.32V17.408A10.638222 10.638222 0 0 1 189.667556 9.045333L790.755556 478.378667a42.496 42.496 0 0 1 0 67.072L189.610667 1014.954667a10.581333 10.581333 0 0 1-17.180445-8.476445v-102.968889a21.617778 21.617778 0 0 1 8.078222-16.782222L660.593778 512 180.565333 137.216a21.617778 21.617778 0 0 1-8.078222-16.782222L172.373333 120.32z',
              stopIcon:
                'M10.0875,7.983 C9.66,7.983 9.312,8.2815 9.312,8.652 L9.312,15.348 C9.312,15.717 9.6585,16.017 10.0875,16.017 C10.515,16.017 10.8615,15.717 10.8615,15.348 L10.8615,8.652 C10.8615,8.2815 10.5135,7.983 10.0875,7.983 Z M13.9365,7.983 C13.509,7.983 13.1625,8.2815 13.1625,8.652 L13.1625,15.348 C13.1625,15.717 13.5075,16.017 13.9365,16.017 C14.3655,16.017 14.712,15.717 14.712,15.348 L14.712,8.652 C14.712,8.2815 14.364,7.983 13.9365,7.983 Z M12.012,1.5465 C6.2475,1.5465 1.5585,6.2355 1.5585,12 C1.5585,17.7645 6.2475,22.4535 12.012,22.4535 C17.7765,22.4535 22.4655,17.7645 22.4655,12 C22.4655,6.2355 17.7765,1.5465 12.012,1.5465 Z M12.012,20.9535 C7.0755,20.9535 3.0585,16.9365 3.0585,12 C3.0585,7.0635 7.0755,3.0465 12.012,3.0465 C16.9485,3.0465 20.9655,7.0635 20.9655,12 C20.9655,16.9365 16.9485,20.9535 12.012,20.9535 Z',
              playIcon:
                'M12.657,1.6635 C6.8925,1.6635 2.2035,6.3525 2.2035,12.117 C2.2035,17.8815 6.8925,22.5705 12.657,22.5705 C18.4215,22.5705 23.1105,17.8815 23.1105,12.117 C23.1105,6.3525 18.4215,1.6635 12.657,1.6635 Z M12.657,21.0705 C7.7205,21.0705 3.7035,17.0535 3.7035,12.117 C3.7035,7.1805 7.7205,3.1635 12.657,3.1635 C17.5935,3.1635 21.6105,7.1805 21.6105,12.117 C21.6105,17.0535 17.5935,21.0705 12.657,21.0705 Z M9.777,15.09 C9.777,15.915 10.362,16.2525 11.076,15.84 L16.2225,12.8685 C16.938,12.456 16.938,11.781 16.2225,11.3685 L11.076,8.3955 C10.3605,7.983 9.777,8.3205 9.777,9.1455 L9.777,15.09 Z'
            },
            this.controlStyle
          ),
          checkpointStyle: Object.assign(
            {
              color: this.primaryColor,
              borderColor: this.avatarBackground,
              borderWidth: 2,
              symbolSize: 13
            },
            this.checkpointStyle
          ),
          emphasis: {
            label: {},
            itemStyle: {},
            controlStyle: {},
            ...(this.emphasis || {})
          },
          padding: 0,
          left: 0,
          right: 0,
          top: 'middle'
        },
        tooltip: {
          position: function(point, params, dom, rect, size) {
            return [point[0] - size.contentSize[0] / 2, '-15'];
          },
          backgroundColor: this.tooltipBackground,
          textStyle: {
            color: this.tooltipColor,
            fontFamily: 'MicrosoftYaHei',
            fontSize: 14
          },
          padding: [6, 8],
          extraCssText: `0px 2px 7px 0px ${this.shadowColor}`
        }
      }
    };
    const { label, itemStyle, controlStyle } = options.baseOption.timeline;
    const emphasisStyle = Object.assign(
      {
        label: {},
        itemStyle: {},
        controlStyle: {}
      },
      this.emphasis || {}
    );
    options.baseOption.timeline.emphasis.label = Object.assign({}, label, {
      color: this.hoverColor,
      ...emphasisStyle.label
    });
    options.baseOption.timeline.emphasis.itemStyle = Object.assign(
      {},
      { ...itemStyle, color: itemStyle.borderColor, borderColor: itemStyle.color },
      emphasisStyle.itemStyle
    );
    options.baseOption.timeline.emphasis.controlStyle = Object.assign({}, controlStyle, emphasisStyle.controlStyle);
    return Object.assign({}, options);
  }

  @Emit('timelinechanged')
  timelineChange(val) {
    if (typeof this.nextEnable === 'boolean') {
      this.nextStep();
    }
    return val;
  }

  @Emit('timelineplaychanged')
  timelineplaychanged(val) {
    this.playState = val.playState;
    return val;
  }

  setPlayState(status) {
    if (this.$refs[this.chartId]) {
      // @ts-ignore
      this.$refs[this.chartId].chart.dispatchAction({
        type: 'timelinePlayChange',
        playState: status
      });
    }
  }

  nextStep() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const playState = this.playState;
    this.setPlayState(false);
    this.timer = setInterval(() => {
      if (this.nextEnable) {
        clearInterval(this.timer);
        this.timer = null;
        if (playState) {
          setTimeout(() => {
            this.setPlayState(true);
          }, Number(this.playInterval));
        }
      }
    }, 100);
  }
}
</script>
