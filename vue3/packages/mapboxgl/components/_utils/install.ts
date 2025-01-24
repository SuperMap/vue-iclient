// import { NOOP } from '../functions'

import type { App, Directive } from 'vue'
import type { SFCInstallWithContext, SFCWithInstall } from './typescript'
export type { SFCWithInstall }

export const withInstall = <T>(comp: T) => {
  ;(comp as SFCWithInstall<T>).install = (app: App): void => {
    // @ts-ignore
    app.component(comp?.name, comp)
  }
  return comp as SFCWithInstall<T>
}

export const withInstallFunction = <T>(fn: T, name: string) => {
  ;(fn as SFCWithInstall<T>).install = (app: App) => {
    ;(fn as SFCInstallWithContext<T>)._context = app._context
    app.config.globalProperties[name] = fn
  }

  return fn as SFCInstallWithContext<T>
}

export const withInstallDirective = <T extends Directive>(directive: T, name: string) => {
  ;(directive as SFCWithInstall<T>).install = (app: App): void => {
    app.directive(name, directive)
  }

  return directive as SFCWithInstall<T>
}

// export const withNoopInstall = <T>(component: T) => {
//   ;(component as SFCWithInstall<T>).install = NOOP

//   return component as SFCWithInstall<T>
// }
