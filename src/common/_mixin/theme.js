import globalEvent from '../_utils/global-event';

export default {
  props: {
    background: {
      type: String
    },
    textColor: {
      type: String
    },
    colorGroup: {
      type: Array
    }
  },
  watch: {
    background: function(newValue) {
      this.backgroundData = newValue;
    },
    textColor: function(newValue) {
      this.textColorsData = newValue;
    },
    colorGroup: function(newValue, oldValue) {
      this.colorGroupsData = newValue;
    }
  },
  data() {
    let theme = globalEvent.theme;
    return {
      backgroundData: this.background || (theme && theme.background),
      textColorsData: this.textColor || (theme && theme.textColor),
      colorGroupsData: this.colorGroup || (theme && theme.colorGroup)
    };
  },
  mounted() {
    globalEvent.$on('change-theme', themeStyle => {
      this.backgroundData = themeStyle.background;
      this.textColorsData = themeStyle.textColor;
      this.colorGroupsData = themeStyle.colorGroup;
      this.$emit('themeStyleChanged');
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
