import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import globalEvent from '../_utils/global-event';
import { getColorWithOpacity } from '../_utils/util';

@Component({
  name: 'Theme'
})
export default class Theme extends Vue {
  backgroundData: string = '';

  backgroundLightData: string = '';

  backgroundBaseData: string = '';

  textColorsData: string = '';

  selectedColorData: string = '';

  hoverColorData: string = '';

  clickColorData: string = '';

  successColorData: string = '';

  infoColorData: string = '';

  warningColorData: string = '';

  dangerColorData: string = '';

  disabledBgColorData: string = '';

  disabledBorderColorData: string = '';

  collapseCardBackgroundData: string = '';

  collapseCardHeaderBgData: string = '';

  tablePopupBgData: string = '';

  colorGroupsData: Array<string> = [];

  @Prop() background: string;

  @Prop() backgroundLight: string;

  @Prop() backgroundBase: string;

  @Prop() textColor: string;

  @Prop() selectedColor: string;

  @Prop() hoverColor: string;

  @Prop() clickColor: string;

  @Prop() successColor: string;

  @Prop() infoColor: string;

  @Prop() warningColor: string;

  @Prop() dangerColor: string;

  @Prop() disabledBgColor: string;

  @Prop() disabledBorderColor: string;

  @Prop() borderBaseColor: string;

  @Prop() collapseCardHeaderTextColor: string;

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
      color: getColorWithOpacity(this.textColorsData, 0.85)
    };
  }

  get normalTextColorStyle() {
    return {
      color: getColorWithOpacity(this.textColorsData, 0.65)
    };
  }

  get secondaryTextColorStyle() {
    return {
      color: getColorWithOpacity(this.textColorsData, 0.45)
    };
  }

  get disabledTextColorStyle() {
    return {
      color: getColorWithOpacity(this.textColorsData, 0.25)
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
      const $props = this.getSelfProps();
      $props.forEach((prop: string) => {
        const dataName: string = this.getDataNameOfProp(prop);
        this[dataName] = themeStyle[prop];
        if (prop === 'textColor') {
          this[dataName] = getColorWithOpacity(this[dataName], 1, false);
        }
      });
      this.collapseCardHeaderBgData = themeStyle['collapseCardHeaderBg'];
      this.collapseCardBackgroundData = themeStyle['collapseCardBackground'];
      this.tablePopupBgData = themeStyle['messageBackground'];
      this.themeStyleChanged();
    });
  }

  initThemeData(): void {
    let theme = globalEvent.$options.theme;
    const $props = this.getSelfProps();
    $props.forEach((prop: string) => {
      const dataName: string = this.getDataNameOfProp(prop);
      this[dataName] = this[prop] || (theme && theme[prop]);
      if (prop === 'textColor' && !this[prop]) {
        this[dataName] = getColorWithOpacity(this[dataName], 1, false);
      }
    });
    this.collapseCardHeaderBgData = this.background || (theme && theme['collapseCardHeaderBg']);
    this.collapseCardBackgroundData = this.background || (theme && theme['collapseCardBackground']);
    this.tablePopupBgData = this.background || (theme && theme['messageBackground']);
  }

  registerPropListener(): void {
    const vm = this;
    const $props = this.getSelfProps();
    $props.forEach((prop: string) => {
      this.$watch(prop, function(next) {
        const dataName: string = this.getDataNameOfProp(prop);
        vm[dataName] = next;
        if (prop === 'background') {
          vm.collapseCardBackgroundData = next;
          vm.collapseCardHeaderBgData = next;
          vm.tablePopupBgData = next;
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
