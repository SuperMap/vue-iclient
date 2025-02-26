import type { PropType } from 'vue'
import type { ConfigProviderProps } from 'ant-design-vue'

export type AntdAliasToken = ConfigProviderProps['theme']['token']

export type CustonAliasToken = {
  // 全局配置
  classPrefix: string
  iconClassPrefix: string
  themeType: keyof ThemeMapping
  // gis 组件
  gisControlBg: string
  gisControlHeaderBg: string
  gisControlHeaderBorder: string
  gisControlItemBgSelected: string
  gisControlItemBgHover: string
  // border 自定义
  colorBorderEmphasis: string
  // shadow 自定义
  shadowColor: string
  // 滚动条自定义
  scrollbarBg: string;
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
  themeStyle: keyof ThemeMapping | AliasToken
  themeType?: keyof ThemeMapping
  triggerEvent?: boolean
}

export interface RootStyleOptions {
  id?: string;
  className?: string;
}