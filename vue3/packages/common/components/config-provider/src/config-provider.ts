import { defineComponent, renderSlot } from 'vue'
import { provideGlobalConfig } from './hooks/use-global-config'
import { configProviderProps } from './config-provider-props'

const ConfigProvider = defineComponent({
  name: 'SMConfigProvider',
  props: configProviderProps,

  setup(props, { slots }) {
    const config = provideGlobalConfig(props)
    return () => renderSlot(slots, 'default', { config: config?.value })
  }
})
export type ConfigProviderInstance = InstanceType<typeof ConfigProvider>

export default ConfigProvider
