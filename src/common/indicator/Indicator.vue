<template>
  <div class="sm-component-indicator" :style="getBackgroundStyle">
    <div :class="`sm-component-indicator__content sm-component-indicator__content-${mode}`">
      <span
        v-show="showTitleUnit"
        class="sm-component-indicator__title"
        :style="[unit_titleStyle, getTextColorStyle]"
      >{{ titleData }}</span>
      <div>
        <span class="sm-component-indicator__num" :style="indicatorStyle">
          <countTo
            v-if="isNumber(indicatorNum)"
            :decimals="calDecimals"
            :startVal="startData"
            :endVal="numData"
            :duration="Number(duration) || 1000"
            :separator="separator"
            :numBackground="numBackground"
            :numSpacing="numSpacing"
            :separatorBackground="separatorBackground"
            :fontSize="parseFloat(fontSize) + fontUnit"
          ></countTo>
          {{ isNumber(indicatorNum) ? '' : indicatorNum }}
        </span>
        <span
          v-show="showTitleUnit"
          class="sm-component-indicator__unit"
          :style="[unit_titleStyle, getTextColorStyle]"
        >{{ unitData }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Theme from '../_mixin/Theme';
import Timer from '../_mixin/Timer';
import RestService from '../../common/_utils/RestService';
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
    // title/unit
    textFontSize: {
      type: [String, Number]
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
    proxy: {
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
        return { color: 'rgba(0, 0, 0, 0)', image: '', padding: 0 };
      }
    },
    separatorBackground: {
      type: Boolean,
      default: false
    },
    showTitleUnit: {
      type: Boolean,
      default: true
    },
    titleField: String,
    numField: String,
    unitField: String,
    thresholdsStyle: Array
  },
  data() {
    return {
      indicatorColorData: '',
      titleData: this.title,
      unitData: this.unit,
      numData: 0,
      startData: 0,
      indicatorNum: 0
    };
  },
  computed: {
    unit_titleStyle() {
      return {
        fontSize: this.textFontSize || parseFloat(this.fontSize) * 0.66 + this.fontUnit,
        fontWeight: this.fontWeight
      };
    },
    fontUnit() {
      const reg = /\d+(\.\d+)?([a-z]+)/gi;
      const fontUnit = this.fontSize && isNaN(this.fontSize) ? this.fontSize.replace(reg, '$2') : 'px';
      return fontUnit;
    },
    indicatorStyle() {
      let color = this.indicatorColorData;
      if (!isNaN(this.indicatorNum) && this.thresholdsStyle) {
        const matchStyle = this.thresholdsStyle.find(item => {
          let status;
          if (item.min) {
            status = +this.indicatorNum >= +item.min;
          }
          if (item.max) {
            status = status === void 0 ? true : status;
            status = status && +this.indicatorNum <= +item.max;
          }
          return status;
        });
        if (matchStyle) {
          color = matchStyle.color;
        }
      }
      let style = { color };
      typeof this.indicatorNum === 'string' && (style.fontSize = parseFloat(this.fontSize) + this.fontUnit);
      return style;
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
          this.fetchProperties = null;
        }
      },
      immediate: true
    },
    indicatorColor(val) {
      this.indicatorColorData = val;
    },
    proxy() {
      this.restService && this.restService.setProxy(this.proxy);
      if (this.url) {
        this.getData();
      }
    }
  },
  mounted() {
    this.$on('theme-style-changed', () => {
      this.indicatorColorData = this.getColor(0);
    });
    this.indicatorColorData = this.indicatorColor || this.getColor(0);
    this.partsOfPropsWatcher();
  },
  beforeDestroy() {
    this.restService && this.restService.remove('getdatasucceeded');
  },
  methods: {
    partsOfPropsWatcher() {
      const propsFields = ['title', 'unit', 'num', 'titleField', 'unitField', 'numField'];
      propsFields.forEach(props => {
        this.$watch(props, function(next) {
          switch (props) {
            case 'title':
              this.titleData = next;
              break;
            case 'titleField':
              if (this.fetchProperties && this.fetchProperties.hasOwnProperty(next)) {
                this.titleData = this.fetchProperties[this.titleField];
              } else {
                this.titleData = this.title;
              }
              break;
            case 'unit':
              this.unitData = next;
              break;
            case 'unitField':
              if (this.fetchProperties && this.fetchProperties.hasOwnProperty(next)) {
                this.unitData = this.fetchProperties[this.unitField];
              } else {
                this.unitData = this.unit;
              }
              break;
            case 'num':
              this.changeNumData(next);
              break;
            case 'numField':
              if (this.fetchProperties && this.fetchProperties.hasOwnProperty(next)) {
                this.changeNumData(this.fetchProperties[this.numField]);
              } else {
                this.changeNumData(this.num);
              }
              break;
          }
        });
      });
    },
    isNumber(str) {
      return /^\d+$/.test(str);
    },
    timing() {
      this.getData();
    },
    fetchData({ features }) {
      if (features && !!features.length) {
        const properties = features[0].properties;
        this.fetchProperties = properties;
        this.unitData = properties.hasOwnProperty(this.unitField) ? properties[this.unitField] : this.unit;
        properties.hasOwnProperty(this.numField)
          ? this.changeNumData(properties[this.numField])
          : this.changeNumData(this.num);
        this.titleData = properties.hasOwnProperty(this.titleField) ? properties[this.titleField] : this.title;
      }
    },
    getData() {
      this.getRestService().getData(this.url);
    },
    changeNumData(newData) {
      const startData = this.animated ? +this.numData : +newData;
      this.startData = isNaN(startData) ? 0 : startData;
      this.numData = +newData;
      this.indicatorNum = newData;
    },
    getRestService() {
      if (!this.restService) {
        this.restService = new RestService({ proxy: this.proxy });
        this.restService.on({ getdatasucceeded: this.fetchData });
      }
      return this.restService;
    }
  }
};
</script>
