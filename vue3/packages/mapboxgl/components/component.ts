import { SmConfigProvider } from '@supermapgis/vue-iclient-common/config-provider'
import { SmAttributes } from './attributes'
import type { Plugin } from 'vue'

export default [SmConfigProvider, SmAttributes] as Plugin[]
