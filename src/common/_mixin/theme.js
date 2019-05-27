import mapEvent from '../../mapboxgl/_types/mapEvent';

export default {
  props: {
    background: {
      type: String,
      default: 'rgba(255,255,255,0.6)'
    },
    textColor: {
      type: String,
      default: '#333'
    }
  },
  watch: {
    background: function (newValue) {
      this.backgroundData = newValue;
    },
    textColor: function (newValue) {
      this.textColorsData = newValue;
    }
  },
  data() {
    return {
      backgroundData: this.background,
      textColorsData: this.textColor,
      colorGroupsData: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8']
    };
  },
  mounted() {
    mapEvent.$on('change-theme', (themeStyle) => {
      this.backgroundData = themeStyle.background;
      this.textColorsData = themeStyle.textColor;
      this.colorGroupsData = themeStyle.colorGroup;
      this.$emit('themeStyle');
      // this.themeStyle = Object.assign({}, this.themeStyle, themeStyle)
    });
  },
  computed: {
    getBackgroundStyle() {
      return {
        background: this.backgroundData
      };
    },
    getTextColorStyle() {
      return {
        color: this.textColorsData
      };
    },
    getBackground() {
      return this.backgroundData;
    },
    getTextColor() {
      return this.textColorsData;
    }
  },
  methods: {
    getColorStyle(index) {
      return {
        color: this.colorGroupsData[index]
      };
    },
    getColor(index) {
      return this.colorGroupsData[index];
    }
  }
};
