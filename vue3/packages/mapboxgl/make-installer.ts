import { INSTALLED_KEY } from '@supermapgis/common/utils/index.common'
import { provideGlobalConfig } from '@supermapgis/common/components/config-provider'
import type { ConfigProviderContext } from '@supermapgis/common/components/config-provider'
import type { App, Plugin } from 'vue'
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
