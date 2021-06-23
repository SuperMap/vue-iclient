import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';
import { getDerivedColorsByTextColor } from 'vue-iclient/src/common/_utils/util';
import { getPrimarySerialColors } from 'vue-iclient/src/common/_utils/style/color/serialColors';

@Component({
  name: 'Theme'
})
export default class Theme extends Vue {
  themeStyleId = '';

  backgroundData = '';

  textColorsData = '';

  collapseCardBackgroundData = '';

  collapseCardHeaderBgData = '';

  tablePopupBgData = '';

  colorGroupsData: Array<string> = [];

  themeStyleName: Array<string> = [];

  @Prop() background: string;

  @Prop() textColor: string;

  @Prop() colorGroup: Array<string>;

  get getBackgroundStyle() {
    return {
      background: this.backgroundData
    };
  }

  get collapseCardBackgroundStyle() {
    return {
      background: this.collapseCardBackgroundData
    };
  }

  get collapseCardBackgroundLightStyle() {
    return {
      background: getPrimarySerialColors({ colorGroup: [this.collapseCardBackgroundData] })[2]
    };
  }

  get collapseCardHeaderBgStyle() {
    return {
      background: this.collapseCardHeaderBgData
    };
  }

  get tablePopupBgStyle() {
    return {
      background: this.tablePopupBgData
    };
  }

  get getTextColorStyle() {
    return {
      color: this.textColorsData
    };
  }

  get headingTextColorStyle() {
    return {
      color: getDerivedColorsByTextColor(this.textColorsData, 0.85)
    };
  }

  get secondaryTextColorStyle() {
    return {
      color: getDerivedColorsByTextColor(this.textColorsData, 0.45)
    };
  }

  get disabledTextColorStyle() {
    return {
      color: getDerivedColorsByTextColor(this.textColorsData, 0.25)
    };
  }

  get getBackground() {
    return this.backgroundData;
  }

  get getTextColor() {
    return this.textColorsData;
  }

  get getColorStyle() {
    return function (index) {
      return {
        color: this.colorGroupsData[index]
      };
    };
  }

  get getColor() {
    return function (index) {
      return this.colorGroupsData[index];
    };
  }

  @Emit()
  themeStyleChanged(value?) {
    return value;
  }

  created() {
    this.initThemeData();
    this.registerPropListener();
  }

  mounted() {
    globalEvent.$on('change-theme', themeStyle => {
      const styleConfigId = themeStyle.styleConfig && themeStyle.styleConfig.id;
      if (this.themeStyleId && styleConfigId !== this.themeStyleId) {
        return;
      }
      this.themeStyleId = styleConfigId;
      const $props = this.getSelfProps();
      $props.forEach((prop: string) => {
        const dataName: string = this.getDataNameOfProp(prop);
        this[dataName] = themeStyle[prop];
      });
      this.collapseCardHeaderBgData = themeStyle.collapseCardHeaderBg;
      this.collapseCardBackgroundData = themeStyle.collapseCardBackground;
      this.tablePopupBgData = themeStyle.messageBackground;
      this.themeStyleChanged();
      this.initNeedTheme(themeStyle);
    });
  }

  initThemeData(): void {
    const theme = globalEvent.$options.theme || {};
    const $props = this.getSelfProps();
    $props.forEach((prop: string) => {
      const dataName: string = this.getDataNameOfProp(prop);
      this[dataName] = this[prop] || theme[prop];
    });
    // @ts-ignore
    this.collapseCardHeaderBgData = this.background || theme.collapseCardHeaderBg;
    // @ts-ignore
    this.collapseCardBackgroundData = this.background || theme.collapseCardBackground;
    // @ts-ignore
    this.tablePopupBgData = this.background || theme.messageBackground;
  }

  initNeedTheme(themeStyle) {
    this.themeStyleName.forEach(name => {
      if (name === 'primaryColor') {
        this[name] = themeStyle.colorGroup && themeStyle.colorGroup[0];
      } else {
        this[name] = themeStyle[name];
      }
    });
  }

  registerPropListener(): void {
    const theme = globalEvent.$options.theme || {};
    const vm = this;
    const $props = this.getSelfProps();
    $props.forEach((prop: string) => {
      this.$watch(prop, function (next) {
        const dataName: string = this.getDataNameOfProp(prop);
        vm[dataName] = next || theme[prop];
        if (prop === 'background') {
          // @ts-ignore
          vm.collapseCardBackgroundData = next || theme.collapseCardBackground;
          // @ts-ignore
          vm.collapseCardHeaderBgData = next || theme.collapseCardHeaderBg;
          // @ts-ignore
          vm.tablePopupBgData = next || theme.messageBackground;
        }
      });
    });
  }

  getSelfProps(): string[] {
    // @ts-ignore
    return Object.keys(Theme.extendOptions.props);
  }

  getDataNameOfProp(prop: string) {
    switch (prop) {
      case 'textColor':
        return 'textColorsData';
      case 'colorGroup':
        return 'colorGroupsData';
      default:
        return `${prop}Data`;
    }
  }
}
