import type { AliasToken, SetThemeOptions, RootStyleOptions } from './interface'
import { themeTokenMapping, themeConfig } from './colors'
import globalEvent from './global-event'
import { toStyleVariable, getRootStyleSelector } from 'vue-iclient-core/utils/style/theme/set-theme'

export const setTheme = (options: SetThemeOptions) => {
  const { themeStyle, triggerEvent } = options;
  let acceptedThemeStyle: AliasToken
  if (typeof themeStyle === 'string') {
    acceptedThemeStyle = themeTokenMapping[themeStyle] || {}
  } else {
    const nextThemeStyle = transformThemeToken(themeStyle)
    const { defaultAlgorithm, darkAlgorithm, defaultSeed } = themeConfig;
    const customStyle = { ...defaultSeed, ...nextThemeStyle };
    const acceptedThemeType = nextThemeStyle.themeType;
    const themeType = acceptedThemeType ?? 'light';
    const customThemeToken = acceptedThemeType === 'dark' ? darkAlgorithm(customStyle) : defaultAlgorithm(customStyle);
    acceptedThemeStyle = Object.assign({}, themeTokenMapping[themeType], customThemeToken)
  }
  globalEvent.changeTheme(acceptedThemeStyle, triggerEvent !== false)
  setRootStyle(acceptedThemeStyle);
}

function transformThemeToken(token: AliasToken) {
  const lightMapToken = themeTokenMapping.light;
  const builtInKeys = Object.keys(token).filter(key => key in lightMapToken)
  return builtInKeys.reduce((mapToken, key) => {
    mapToken[key] = token[key]
    return mapToken;
  }, {} as AliasToken)
}

function setRootStyle(themeStyle: AliasToken, rootStyleOptions?: RootStyleOptions): void {
  const variables: Record<string, string> = {}
  const themeKeys = Object.keys(themeStyle)
  themeKeys.forEach((key: string) => {
    const varKey = toStyleVariable(key)
    variables[varKey] = themeStyle[key] || 'rgba(0, 0, 0, 0)'
  })
  const rootStyleSelector = getRootStyleSelector(rootStyleOptions?.className)
  const styleDomId = rootStyleOptions?.id || 'sm-component-style'
  const rootStyle = `${rootStyleSelector} ${JSON.stringify(variables, null, 2)
    .replace(/(:.+),/g, '$1;')
    .replace(/"/g, '')}`
  let rootStyleDom = document.getElementById(styleDomId)
  if (!rootStyleDom) {
    rootStyleDom = document.createElement('style')
    rootStyleDom.setAttribute('id', styleDomId)
    rootStyleDom.setAttribute('type', 'text/css')
    document.head.insertBefore(rootStyleDom, document.head.firstChild)
  }
  rootStyleDom.innerHTML = rootStyle
}
