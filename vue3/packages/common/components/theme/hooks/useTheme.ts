import type { AliasToken, ThemeProps, ThemeMapping } from '../interface'
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { pick, isEqual } from 'lodash-es'
import { getDerivedColorsByTextColor } from 'vue-iclient-core/utils/util';
import globalEvent from '../global-event'
import { themeTokenMapping } from '../colors'

export function useTheme(props: ThemeProps, themeAliasToken: AliasToken = globalEvent.theme) {
  const themePropKeys = ['background', 'textColor', 'colorGroup']
  const themeToken = ref<AliasToken>({
    ...themeTokenMapping[themeAliasToken?.themeType || 'light']
  })
  const specifiedToken = ref<AliasToken>(null)
  const themePropDatas = reactive<AliasToken>(onThemePropChanged(props))

  const themeType = computed<keyof ThemeMapping>(() => {
    return themeToken.value.themeType
  })
  // 组件样式
  const specifiedTheme = computed<ThemeProps>(() => {
    return pick(props, themePropKeys)
  })

  const textColorStyle = computed(() => {
    return { color: themePropDatas.colorText }
  })

  const textColorHeadingStyle = computed(() => {
    return { color: themePropDatas.colorTextHeading }
  })

  const containerBgStyle = computed(() => {
    return { background: themePropDatas.colorBgContainer }
  })

  const popupBgStyle = computed(() => {
    return {
      background: themePropDatas.colorBgElevated
    }
  })

  const gisControlBgStyle = computed(() => {
    return { background: themePropDatas.gisControlBg }
  })

  const gisControlBgTertiaryStyle = computed(() => {
    return { background: themePropDatas.gisControlBgTertiary }
  })

  const gisControlHeaderBgStyle = computed(() => {
    return { background: themePropDatas.gisControlHeaderBg }
  })

  const colorPrimary = computed(() => {
    return themePropDatas.colorPrimary
  })

  function changeThemeCallback(changedTheme: { themeStyle?: AliasToken }) {
    const { themeStyle } = changedTheme
    if (themeStyle) {
      themeToken.value = Object.assign({}, themeStyle)
      Object.assign(themePropDatas, onThemePropChanged())
    }
  }

  function filterEmptyToken(token: Partial<AliasToken>) {
    const nextToken: Partial<AliasToken> = {}
    for (const key in token) {
      if (token[key] ?? true) {
        nextToken[key] = token[key]
      }
    }
    return nextToken
  }

  function onThemePropChanged(propDatas: ThemeProps = {}): AliasToken {
    const { textColor, background, colorGroup } = propDatas;
    return {
      colorPrimary: colorGroup?.[0] ?? themeToken.value.colorPrimary,
      colorBgContainer: background ?? themeToken.value.colorBgContainer,
      colorBgElevated: background ?? themeToken.value.colorBgElevated,
      colorText: textColor ?? themeToken.value.colorText,
      colorTextHeading: textColor ? getDerivedColorsByTextColor(textColor, 0.85) : themeToken.value.colorTextHeading,
      gisControlBg: background ?? themeToken.value.gisControlBg,
      gisControlBgTertiary: background ?? themeToken.value.gisControlBgTertiary,
      gisControlHeaderBg: background ?? themeToken.value.gisControlHeaderBg
    }
  }

  watch(specifiedTheme, (next: ThemeProps, prev: ThemeProps) => {
    if (isEqual(next, prev)) {
      return
    }
    const changedProps: ThemeProps = {};
    const partsToken: AliasToken = {}
    if (next.background !== prev.background) {
      Object.assign(changedProps, { background: next.background })
      Object.assign(partsToken, { colorBgContainer: next.background })
    }
    if (next.textColor !== prev.textColor) {
      Object.assign(changedProps, { textColor: next.textColor })
      Object.assign(partsToken, { colorText: next.textColor })
    }
    if (!isEqual(next.colorGroup, prev.colorGroup)) {
      Object.assign(changedProps, { colorGroup: next.colorGroup })
      const colorPrimary = next.colorGroup[0];
      Object.assign(partsToken, { colorPrimary, colorInfo: colorPrimary })
    }
    Object.assign(themePropDatas, onThemePropChanged(changedProps))
    specifiedToken.value = filterEmptyToken(partsToken)
  })

  onMounted(() => {
    changeThemeCallback({ themeStyle: themeAliasToken })
    globalEvent.on({
      'change-theme': changeThemeCallback
    })
  })

  onBeforeUnmount(() => {
    globalEvent.un({
      'change-theme': changeThemeCallback
    })
  })

  return {
    themeToken,
    specifiedToken,
    themeType,
    textColorStyle,
    textColorHeadingStyle,
    containerBgStyle,
    popupBgStyle,
    gisControlBgStyle,
    gisControlBgTertiaryStyle,
    gisControlHeaderBgStyle,
    colorPrimary
  }
}
