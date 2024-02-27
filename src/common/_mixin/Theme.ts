import Vue, { VNode, CreateElement } from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';
import { getDerivedColorsByTextColor } from 'vue-iclient/src/common/_utils/util';
import { getPrimarySerialColors, getRootStyleSelector } from 'vue-iclient/src/common/_utils/style/color/serialColors';

type ThemeStyleParams = typeof globalEvent.$options.theme;
@Component({
  name: 'Theme'
})
export default class Theme extends Vue {
  backgroundData = '';

  textColorsData = '';

  collapseCardBackgroundData = '';

  collapseCardHeaderBgData = '';

  subComponentSpanBgData = '';

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

  get subComponentSpanBgStyle() {
    return {
      background: this.subComponentSpanBgData
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
    globalEvent.$on('change-theme', this.changeThemeCallback);
  }

  beforeDestroy() {
    globalEvent.$off('change-theme', this.changeThemeCallback);
  }

  changeThemeCallback(themeStyle: ThemeStyleParams) {
    this.setDataRelatedProps(themeStyle, true);
    if ('background' in themeStyle) {
      this.setDataRelatedWithBackgound('', themeStyle);
    }
    // this.themeStyleChanged();
    this.initNeedTheme(themeStyle);
  }

  initThemeData(): void {
    this.setDataRelatedProps();
    this.setDataRelatedWithBackgound(this.background);
  }

  initNeedTheme(themeStyle) {
    this.themeStyleName.forEach(name => {
      if (name === 'primaryColor') {
        this[name] = themeStyle.colorGroup && themeStyle.colorGroup[0];
      } else {
        this[name] = this.getRealColor(name, themeStyle);
      }
    });
  }

  registerPropListener(): void {
    const vm = this;
    const $props = this.getSelfProps();
    $props.forEach((prop: string) => {
      this.$watch(prop, function (next) {
        const dataName: string = this.getDataNameOfProp(prop);
        vm[dataName] = next || this.getRealColor(prop);
        if (prop === 'background') {
          vm.setDataRelatedWithBackgound(next);
        }
      });
    });
  }

  setDataRelatedProps(themeStyle?: ThemeStyleParams, themePriority?: boolean) {
    const themeStyleData = themeStyle || globalEvent.$options.theme || {};
    const $props = this.getSelfProps();
    $props.forEach((prop: string) => {
      if (prop in themeStyleData) {
        const dataName: string = this.getDataNameOfProp(prop);
        const propValue = themePriority ? '' : this[prop];
        this[dataName] = propValue || this.getRealColor(prop, themeStyle);
      }
    });
  }

  setDataRelatedWithBackgound(background?: string, themeStyle?: ThemeStyleParams) {
    this.collapseCardHeaderBgData = background || this.getRealColor('collapseCardHeaderBg', themeStyle);
    this.subComponentSpanBgData = background || this.getRealColor('subComponentSpanBg', themeStyle);
    this.collapseCardBackgroundData = background || this.getRealColor('collapseCardBackground', themeStyle);
    this.tablePopupBgData = background || this.getRealColor('messageBackground', themeStyle);
  }

  getSelfProps(): string[] {
    // @ts-ignore
    return Object.keys(Theme.extendOptions.props);
  }

  getRealColor(prop: string, acceptThemeStyle?: ThemeStyleParams) {
    const themeStyle = acceptThemeStyle || globalEvent.$options.theme || {};
    if (prop === 'colorGroup' || !themeStyle[prop] || !themeStyle[prop].includes('var')) {
      return themeStyle[prop];
    }
    const rootStyleSelector = getRootStyleSelector(themeStyle);
    const computedStyle = window.getComputedStyle(document.querySelector(rootStyleSelector));
    const themeColor = themeStyle[prop].replace(/var\((.+)\)/g, '$1');
    const colorValue = computedStyle.getPropertyValue(themeColor);
    return colorValue.trim();
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

  render(h: CreateElement): VNode {
    return h('template', null);
  }
}
