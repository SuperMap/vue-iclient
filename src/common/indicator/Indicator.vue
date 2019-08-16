<template>
  <div class="sm-component-indicator" :style="[getBackgroundStyle,{'flex-direction':direction}]">
    <div class="sm-component-indicator__head">
      <span
        class="sm-component-indicator__title"
        :style="[unit_titleStyle, getTextColorStyle]"
      >{{ titleData }}</span>
    </div>
    <div class="sm-component-indicator__content">
      <span class="sm-component-indicator__num" :style="[numStyle, indicatorStyle]">
        <countTo
          ref="countTo"
          :startVal="startData"
          :endVal="numData"
          :duration="Number(duration) || 1000"
          :separator="separator"
        ></countTo>
      </span>
      <span
        class="sm-component-indicator__unit"
        :style="[unit_titleStyle, getTextColorStyle]"
      >{{ unitData }}</span>
    </div>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';
import Timer from '../_mixin/timer';
import RestService from '../../mapboxgl/_utils/RestService';
import countTo from 'vue-count-to';

export default {
  name: 'SmIndicator',
  components: {
    countTo
  },
  mixins: [Theme, Timer],
  props: {
    title: {
      type: String,
      default: '指标标题'
    },
    unit: {
      type: String,
      default: '单位'
    },
    indicatorColor: {
      type: String
    },
    fontSize: {
      type: [String, Number]
    },
    fontWeight: {
      type: [String, Number],
      default: 'border'
    },
    num: {
      type: [Number, String],
      default: 0
    },
    url: {
      type: String
    },
    animated: {
      type: Boolean,
      default: false
    },
    duration: {
      type: [Number, String],
      default: 1000
    },
    mode: {
      type: String,
      default: 'vertical',
      validator: function(val) {
        return ['vertical', 'horizontal'];
      }
    },
    separator: {
      type: String,
      default: ','
    }
  },
  data() {
    return {
      titleData: this.title,
      unitData: this.unit,
      numData: 0,
      startData: 0
    };
  },
  computed: {
    numStyle() {
      return { fontSize: this.fontSize };
    },
    unit_titleStyle() {
      const reg = /\d+(\.\d+)?([a-z]+)/gi;
      const fontUnit = this.fontSize ? this.fontSize.replace(reg, '$2') : '';
      return {
        fontSize: parseFloat(this.fontSize) * 0.66 + fontUnit,
        fontWeight: this.fontWeight
      };
    },
    indicatorStyle() {
      return (this.indicatorColor && { color: this.indicatorColor }) || this.getColorStyle(0);
    },
    direction() {
      return { vertical: 'column', horizon: 'row' }[this.mode];
    }
  },
  watch: {
    url: {
      handler(val) {
        if (val) {
          this.getData();
        } else {
          this.unitData = this.unit;
          this.changeNumData(this.num);
          this.titleData = this.title;
        }
      },
      immediate: true
    },
    title(val) {
      this.titleData = val;
    },
    unit(val) {
      this.unitData = val;
    },
    num: {
      handler(val) {
        this.changeNumData(val);
      },
      immediate: true
    },
    separator() {
      this.$nextTick(() => {
        this.startData = this.numData;
        this.$refs.countTo.start();
      });
    }
  },
  mounted() {
    this.restService = new RestService();
    this.restService.on('getdatasucceeded', this.fetchData);
  },
  beforeDestroy() {
    this.restService.off('getdatasucceeded', this.fetchData);
  },
  methods: {
    timing() {
      this.getData();
    },
    fetchData(data) {
      this.unitData = data.data.unit;
      this.changeNumData(data.data.num);
      this.titleData = data.data.title;
    },
    getData() {
      this.restService && this.restService.getData(this.url);
    },
    changeNumData(newData) {
      this.startData = this.animated ? +this.numData : +newData;
      this.numData = +newData;
    }
  }
};
</script>
