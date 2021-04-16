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
import { getColorWithOpacity } from 'vue-iclient/src/common/_utils/util';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import ECharts from 'vue-echarts';
import { Component, Prop, Mixins, Emit } from 'vue-property-decorator';
import UniqueId from 'lodash.uniqueid';

const ThemeStyleName = ['headingColor', 'primaryColor', 'disabledBgColor', 'textColorSecondary', 'handleColor'];

@Component({
  name: 'SmTimeRange',
  components: {
    'v-chart': ECharts
  }
})
class SmTimeRange extends Mixins(Theme) {
  chartId = UniqueId(`TimeRange-`);
  headingColor: string = 'rgba(255, 255, 255, 0.85)';
  primaryColor: string = '#e14d57';
  disabledBgColor: string = 'rgba(255, 255, 255, 0.08)';
  textColorSecondary: string = 'rgba(255, 255, 255, 0.45)';
  handleColor: string = '#d9d9d9';
  themeStyleName: string[] = ThemeStyleName;

  @Prop({ default: 0 }) startValue: string | number;
  @Prop({ default: 1 }) endValue: string | number;
  @Prop({
    default() {
      return [];
    }
  })
  data: Array<any>;

  @Prop() backgroundColor: string;
  @Prop() borderColor: string;
  @Prop() fillerColor: string;
  @Prop({
    default() {
      return {};
    }
  })
  textStyle: Object;

  @Prop({
    default() {
      return {};
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
          right: 1,
          backgroundColor: this.backgroundColor || this.disabledBgColor || this.getBackground,
          borderColor: this.borderColor || this.textColorSecondary,
          fillerColor: this.fillerColor || this.primaryColor || getColorWithOpacity(this.getTextColor, 0.3),
          textStyle: Object.assign(
            {
              fontFamily: 'MicrosoftYaHei',
              fontSize: 12,
              color: this.headingColor
            },
            this.textStyle || {}
          ),
          handleStyle: Object.assign({ color: this.handleColor }, this.handleStyle || {})
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
  dataZoomChanged() {
    // @ts-ignore
    let { startValue, endValue } = this.$refs[this.chartId].chart.getOption().dataZoom[0];
    return { startValue, endValue };
  }
}
export default SmTimeRange;
</script>
