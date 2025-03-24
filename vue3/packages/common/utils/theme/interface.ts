import type { PropType } from 'vue'
import type { ConfigProviderProps } from 'ant-design-vue'

export type AntdAliasToken = NonNullable<NonNullable<ConfigProviderProps['theme']>['token']>

export type CustonAliasToken = {
  // 全局配置
  classPrefix: string
  iconClassPrefix: string
  themeType: keyof ThemeMapping
  // gis 组件
  gisControlBg: string
  gisControlBgSecondary: string
  gisControlBgTertiary: string
  gisControlHeaderBg: string
  gisControlHeaderBorder: string
  gisControlItemBgHover: string
  gisControlSuffixBg: string
  // 主色选中背景颜色 自定义
  colorPrimarySelected: string
  // shadow 自定义
  shadowColor: string
  // 滚动条自定义
  scrollbarBg: string;
  tooltipColor: string;
  compareSwiperColor: string;
  compareSwiperBackground: string
}

export interface AliasToken extends AntdAliasToken, Partial<CustonAliasToken> {}

export type ThemeMapping = {
  light: AliasToken
  dark: AliasToken
}

export const themeProps = () => ({
  background: String,
  textColor: String,
  colorGroup: Array as PropType<Array<string>>
})

// export type ThemeProps = Partial<ExtractPropTypes<ReturnType<typeof themeProps>>>
export type ThemeProps = {
  background?: string
  textColor?: string
  colorGroup?: string[]
}

export interface SetThemeOptions {
  themeStyle: Partial<AliasToken>;
  triggerEvent?: boolean
  styleConfig?: RootStyleOptions
  ignoreExtras?: boolean
}

export interface RootStyleOptions {
  id?: string;
  className?: string;
}