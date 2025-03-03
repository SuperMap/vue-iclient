import type { ThemeMapping, CustonAliasToken } from './interface'
import { theme } from 'ant-design-vue'
import { toHex8String } from 'vue-iclient-core/utils/util'

const { defaultAlgorithm, darkAlgorithm, defaultSeed } = theme

const globalSeed: Partial<CustonAliasToken> = {
  classPrefix: 'sm-component',
  iconClassPrefix: 'sm-components-icon'
}

export const themeConfig = theme

export const themeTokenMapping: ThemeMapping = {
  dark: {
    // antd
    // 如果想要和vue2计算主题色的算法保持一致，就用 defaultAlgorithm，否则采用最新算法 darkAlgorithm
    ...darkAlgorithm({
      ...defaultSeed,
      blue: '#3499E5',
      green: '#3DAB1B',
      red: '#E04C40',
      gold: '#E2CA34',
      colorPrimary: '#3499E5',
      colorSuccess: '#3DAB1B',
      colorWarning: '#E2CA34',
      colorError: '#E04C40',
      colorInfo: '#3499E5',
      colorTextBase: '#fff',
      colorBgBase: '#000'
    }),
    ...globalSeed,
    themeType: 'dark',
    // 覆盖 antd
    colorPrimaryHover: '#65C0FC',
    colorPrimaryActive: '#0371C3',
    colorBgContainer: toHex8String('#fff', 0.04),
    colorBgElevated: '#414141',
    controlItemBgActive: toHex8String('#3499E5', 0.15),
    colorText: toHex8String('#fff', 0.65),
    colorTextHeading: toHex8String('#fff', 0.85),
    colorBorder: toHex8String('#fff', 0.25),
    colorBorderSecondary: toHex8String('#fff', 0.15),
    // 自定义
    colorPrimarySelected: toHex8String('#3499E5', 0.15),
    shadowColor: toHex8String('#000', 0.35),
    scrollbarBg: toHex8String('#fff', 0.15),
    // gis
    gisControlBg: '#414141',
    gisControlBgSecondary: toHex8String('#000', 0.08),
    gisControlHeaderBg: '#4a4a4a',
    gisControlHeaderBorder: '#4a4a4a',
    gisControlItemBgHover: toHex8String('#fff', 0.08),
    gisControlSuffixBg: '#414141'
  },
  light: {
    // antd
    ...defaultAlgorithm({
      ...defaultSeed,
      blue: '#0081E2',
      green: '#00bc00',
      red: '#e41318',
      gold: '#f2b200',
      colorPrimary: '#0081E2',
      colorSuccess: '#00bc00',
      colorWarning: '#f2b200',
      colorError: '#e41318',
      colorInfo: '#0081E2',
      colorTextBase: '#000',
      colorBgBase: '#fff'
    }),
    ...globalSeed,
    themeType: 'light',
    // 覆盖 antd
    colorPrimaryHover: '#008EF0',
    colorPrimaryActive: '#006ECF',
    colorBgContainer: '#fff',
    controlItemBgActive: toHex8String('#0081E2', 0.08),
    colorText: toHex8String('#000', 0.65),
    colorTextHeading: toHex8String('#000', 0.85),
    colorBorder: toHex8String('#000', 0.15),
    colorBorderSecondary: toHex8String('#000', 0.08),
    // 自定义
    colorPrimarySelected: toHex8String('#0081E2', 0.08),
    shadowColor: toHex8String('#000', 0.15),
    scrollbarBg: toHex8String('#000', 0.15),
    // gis
    gisControlBg: '#fff',
    gisControlBgSecondary: toHex8String('#000', 0.04),
    gisControlHeaderBg: '#fff',
    gisControlHeaderBorder: toHex8String('#000', 0.15),
    gisControlItemBgHover: toHex8String('#000', 0.08),
    gisControlSuffixBg: toHex8String('#000', 0.08)
  }
}
