import Vue from 'vue';
import { Component, Prop, Watch, Emit } from 'vue-property-decorator';
import globalEvent from '../_utils/global-event';

@Component
export default class Theme extends Vue {
  backgroundData: string = '';

  textColorsData: string = '';

  colorGroupsData: Array<string> = [];

  @Prop() background: string;

  @Prop() textColor: string;

  @Prop() colorGroup: Array<string>;

  @Watch('background')
  backgroundChanged(newValue) {
    this.backgroundData = newValue;
  }

  @Watch('textColor')
  textColorChanged(newValue) {
    this.textColorsData = newValue;
  }

  @Watch('colorGroup')
  colorGroupChanged(newValue) {
    this.colorGroupsData = newValue;
  }

  get getBackgroundStyle() {
    return {
      background: this.backgroundData
    };
  }

  get getTextColorStyle() {
    return {
      color: this.textColorsData
    };
  }

  get getBackground() {
    return this.backgroundData;
  }

  get getTextColor() {
    return this.textColorsData;
  }

  get getColorStyle() {
    return function(index) {
      return {
        color: this.colorGroupsData[index]
      };
    };
  }

  get getColor() {
    return function(index) {
      return this.colorGroupsData[index];
    };
  }

  created() {
    let theme = globalEvent.$options.theme;
    this.backgroundData = this.background || (theme && theme.background);
    this.textColorsData = this.textColor || (theme && theme.textColor);
    this.colorGroupsData = this.colorGroup || (theme && theme.colorGroup);
  }

  @Emit()
  themeStyleChanged(value?) {
    return value;
  }
  mounted() {
    globalEvent.$on('change-theme', themeStyle => {
      this.backgroundData = themeStyle.background;
      this.textColorsData = themeStyle.textColor;
      this.colorGroupsData = themeStyle.colorGroup;
      this.themeStyleChanged();
    });
  }
}
