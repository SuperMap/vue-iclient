<template>
  <div class="sm-component-time-range" :style="[getBackgroundStyle]">
    <v-chart
      :id="chartId"
      :ref="chartId"
      :options="options"
      :autoresize="true"
      :style="{width: '100%', height: '100%'}"
      @datazoom="dataZoomChanged"
    />
  </div>
</template>

<script lang="ts">
import { getColorWithOpacity } from '../_utils/util';
import Theme from '../_mixin/Theme';
// @ts-ignore
import ECharts from 'vue-echarts';
import { Component, Prop, Mixins, Emit } from 'vue-property-decorator';
import UniqueId from 'lodash.uniqueid';

@Component({
  name: 'SmTimeRange',
  components: {
    'v-chart': ECharts
  }
})
class SmTimeRange extends Mixins(Theme) {
  chartId = UniqueId(`TimeRange-`);
  @Prop({ default: 0 }) startValue: string | number;
  @Prop({ default: 1 }) endValue: string | number;
  @Prop({
    default() {
      return [];
    }
  })
  data: Array<any>;
  @Prop({ default: 'rgba(47,69,84,0)' }) backgroundColor: string;
  @Prop({ default: '#ddd' }) borderColor: string;
  @Prop({ default: 'rgba(167,183,204,0.4)' }) fillerColor: string;
  @Prop({
    default() {
      return { color: '#ccc' };
    }
  })
  textStyle: Object;
  @Prop({
    default() {
      return { color: '#ccc' };
    }
  })
  handleStyle: Object;

  get color() {
    return this.getColor(0);
  }
  get options() {
    let options = {
      dataZoom: [
        {
          show: true,
          showDetail: true,
          realtime: true,
          type: 'slider',
          startValue: this.startValue,
          endValue: this.endValue,
          left: 0,
          top: 'middle',
          right: 5,
          backgroundColor: this.backgroundColor || this.getBackground,
          borderColor: this.borderColor,
          fillerColor: this.fillerColor || getColorWithOpacity(this.getTextColor, 0.3),
          textStyle: Object.assign({ color: this.getTextColor }, this.textStyle || {}),
          handleStyle: Object.assign({ color: this.getColor(1) }, this.handleStyle || {})
        }
      ],
      xAxis: [
        {
          show: false,
          type: 'category',
          boundaryGap: false,
          axisLine: { onZero: false },
          data: this.data
        }
      ],
      yAxis: [
        {
          show: false
        }
      ],
      series: []
    };
    return Object.assign({}, options);
  }

  @Emit('datazoom')
  dataZoomChanged(val) {
    // @ts-ignore
    let { startValue, endValue } = this.$refs[this.chartId].chart.getOption().dataZoom[0];
    return { startValue, endValue };
  }
}
export default SmTimeRange;
</script>
