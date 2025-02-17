import { provideGlobalConfig } from '@supermapgis/vue-iclient-common/config-provider'
import type { ConfigProviderContext } from '@supermapgis/vue-iclient-common/config-provider'
import type { App, Plugin } from '@vue/runtime-core'
export const INSTALLED_KEY = Symbol('INSTALLED_KEY')

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, options?: ConfigProviderContext) => {
    if (app[INSTALLED_KEY]) return

    app[INSTALLED_KEY] = true
    components.forEach(c => app.use(c))

    if (options) provideGlobalConfig(options, app, true)
  }

  return {
    install
  }
}
