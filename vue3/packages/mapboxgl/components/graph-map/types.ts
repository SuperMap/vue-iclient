import type {
  GraphConfig,
  EmitParams
} from 'vue-iclient-core/controllers/mapboxgl/GraphMapViewModel'

import { getPropsDefaults } from '@supermapgis/common/utils/index.common'
import type { PropType } from 'vue'

const graphMapProps = {
  serviceUrl: {
    type: String,
    required: true
  },
  autoresize: {
    type: Boolean,
    default: true
  },
  options: {
    type: Object as PropType<GraphConfig>
  }
} as const

export interface GraphMapProps {
  serviceUrl: string
  autoresize?: boolean
  options?: GraphConfig
}

export const GraphMapPropsDefault = getPropsDefaults<GraphMapProps>(graphMapProps)

export type GraphMapEmits = {
  (event: 'loaded', knowledgeGraph: EmitParams['knowledgeGraph']): void
}
