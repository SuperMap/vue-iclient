import { SmConfigProvider } from '@supermapgis/common/components/config-provider'
import { SmTimeSlider } from '@supermapgis/common/components/time-slider'
import { SmTimeText } from '@supermapgis/common/components/time-text'

import { SmAttributes } from '@supermapgis/mapboxgl/components/attributes'
import { SmWebMap } from '@supermapgis/mapboxgl/components/web-map'
import { SmGraphMap } from '@supermapgis/mapboxgl/components/graph-map'
import { SmCompare } from '@supermapgis/mapboxgl/components/compare'

import type { Plugin } from 'vue'

export default [
  SmConfigProvider,
  SmTimeSlider,
  SmTimeText,
  SmAttributes,
  SmWebMap,
  SmGraphMap,
  SmCompare
] as Plugin[]
