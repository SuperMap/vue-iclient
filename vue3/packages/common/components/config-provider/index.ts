import { withInstall } from '@supermapgis/common/utils/index.common'

import ConfigProvider from './src/config-provider'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const ElConfigProvider: SFCWithInstall<typeof ConfigProvider> =
  withInstall(ConfigProvider)
export default ElConfigProvider

export * from './src/config-provider'
export * from './src/config-provider-props'
export * from './src/constants'
export * from './src/hooks/use-global-config'
