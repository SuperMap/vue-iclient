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
import Theme from '../_mixin/Theme';
import ECharts from 'vue-echarts';
import { Component, Prop, Mixins, Emit } from 'vue-property-decorator';
import UniqueId from 'lodash.uniqueid';

@Component({
  name: 'SmTimeLine',
  components: {
    'v-chart': ECharts
  }
})
export default class SmTimeLine extends Mixins(Theme) {
  chartId = UniqueId(`TimeLine-`);

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
            color: this.color,
            ...this.label
          },
          lineStyle: this.lineStyle,
          itemStyle: this.itemStyle,
          controlStyle: Object.assign({ color: this.color, borderColor: this.color }, this.controlStyle),
          checkpointStyle: Object.assign({ color: this.color, borderColor: this.color }, this.checkpointStyle),
          emphasis: { label: {} },
          left: '5%',
          top: 'middle',
          right: '5%'
        },
        tooltip: {}
      }
    };
    // @ts-ignore
    options.baseOption.timeline.emphasis.label.fontSize = options.baseOption.timeline.label.fontSize;
    return Object.assign({}, options);
  }
  @Emit('timelinechanged')
  timelineChange(val) {}
  @Emit('timelineplaychanged')
  timelineplaychanged(val) {}
  setPlayState(status) {
    if (this.$refs[this.chartId]) {
      // @ts-ignore
      this.$refs[this.chartId].chart.dispatchAction({
        type: 'timelinePlayChange',
        playState: status
      });
    }
  }
}
</script>
