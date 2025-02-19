import zhCn from './lang/zh-cn'
import en from './lang/en'

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair
}

export type Language = {
  name: string
  sm: TranslatePair
}

export { zhCn, en }
