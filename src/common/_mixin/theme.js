import globalEvent from '../_utils/global-event';

export default {
  props: {
    background: {
      type: String,
      default: 'rgba(255,255,255,0.6)'
    },
    textColor: {
      type: String,
      default: '#333'
    },
    colorGroup: {
      type: Array,
      default() {
        return ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'];
      }
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
      /**
       * 以下操作是暂时解决方另一个问题引起的新问题
       * 起因是data里面在给colorGroupsData赋值时优先取的theme里面的值，
       * 如果theme里有值的话，就取不到props里colorGroup的值(也是json配置文件里面的初始化会失效)
       * 但是AB项目在手动把内联样式转化为rem时，为了不影响store里面的propDatas,在转化rem之前总是先深拷贝一份propDatas的值
       * 所以如果propDatas有里面Object或者Array类型的数据，其引用地址总会改变，即使其里面的值相同
       */
      this.colorGroupsData = JSON.stringify(newValue) !== JSON.stringify(oldValue) ? newValue : this.colorGroupsData;
    }
  },
  data() {
    let theme = globalEvent.theme;
    return {
      backgroundData: (theme && theme.background) || this.background,
      textColorsData: (theme && theme.textColor) || this.textColor,
      colorGroupsData: (theme && theme.colorGroup) || this.colorGroup
    };
  },
  mounted() {
    globalEvent.$on('change-theme', themeStyle => {
      this.backgroundData = themeStyle.background;
      this.textColorsData = themeStyle.textColor;
      this.colorGroupsData = themeStyle.colorGroup;
      this.$emit('themeStyleChanged');
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
