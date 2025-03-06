import { SmConfigProvider } from '@supermapgis/common/components/config-provider'
import { SmAttributes } from '@supermapgis/mapboxgl/components/attributes'
import { SmWebMap } from '@supermapgis/mapboxgl/components/web-map'
import { SmGraphMap } from '@supermapgis/mapboxgl/components/graph-map'
import { SmCompare } from '@supermapgis/mapboxgl/components/compare'

import type { Plugin } from 'vue'

export default [SmConfigProvider, SmAttributes, SmWebMap, SmGraphMap, SmCompare] as Plugin[]
