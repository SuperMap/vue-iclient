import zhCn from './lang/zh-cn'

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair
}

export type Language = {
  name: string
  sm: TranslatePair
}

export { zhCn }
