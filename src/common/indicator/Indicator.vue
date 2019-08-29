<template>
  <div class="sm-component-indicator" :style="[getBackgroundStyle,{'flex-direction':direction}]">
    <div class="sm-component-indicator__head">
      <span
        v-show="showTitleUnit"
        class="sm-component-indicator__title"
        :style="[unit_titleStyle, getTextColorStyle]"
      >{{ titleData }}</span>
    </div>
    <div class="sm-component-indicator__content">
      <span class="sm-component-indicator__num" :style="[indicatorStyle]">
        <countTo
          :decimals="calDecimals"
          :startVal="startData"
          :endVal="numData"
          :duration="Number(duration) || 1000"
          :separator="separator"
          :numBackground="numBackground"
          :numSpacing="numSpacing"
          :separatorBackground="separatorBackground"
          :fontSize="fontSize"
        ></countTo>
      </span>
      <span
        v-show="showTitleUnit"
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
import CountTo from './CountTo';

export default {
  name: 'SmIndicator',
  components: {
    countTo: CountTo
  },
  mixins: [Theme, Timer],
  props: {
    title: {
      type: String,
      default() {
        return this.$t('indicator.title');
      }
    },
    unit: {
      type: String,
      default() {
        return this.$t('indicator.unit');
      }
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
    decimals: {
      type: Number,
      default: -1
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
    },
    numSpacing: {
      type: Number,
      default: 0
    },
    numBackground: {
      type: Object,
      default: function() {
        return { color: 'rgba(0, 0, 0, 0)', image: '' };
      }
    },
    separatorBackground: {
      type: Boolean,
      default: false
    },
    showTitleUnit: {
      type: Boolean,
      default: true
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
      return { vertical: 'column', horizontal: 'row' }[this.mode];
    },
    calDecimals() {
      if (this.decimals > 0) {
        return this.decimals;
      }
      if (this.numData.toString().split('.')[1]) {
        return this.numData.toString().split('.')[1].length;
      }
      return 0;
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
    }
  },
  beforeDestroy() {
    this.restService && this.restService.off('getdatasucceeded', this.fetchData);
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
      this.getRestService().getData(this.url);
    },
    changeNumData(newData) {
      this.startData = this.animated ? +this.numData : +newData;
      this.numData = +newData;
    },
    getRestService() {
      if (!this.restService) {
        this.restService = new RestService();
        this.restService.on('getdatasucceeded', this.fetchData);
      }
      return this.restService;
    }
  }
};
</script>
