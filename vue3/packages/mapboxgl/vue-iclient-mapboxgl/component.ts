import { SmConfigProvider } from '@supermapgis/common/components/config-provider'
import { SmTimeSlider } from '@supermapgis/common/components/time-slider'
import { SmTimeText } from '@supermapgis/common/components/time-text'
import { SmAttributePanel } from '@supermapgis/common/components/attribute-panel'
import { SmIndicator } from '@supermapgis/common/components/indicator'
import { SmText } from '@supermapgis/common/components/text'

import { SmAttributes } from '@supermapgis/mapboxgl/components/attributes'
import { SmWebMap } from '@supermapgis/mapboxgl/components/web-map'
import { SmGraphMap } from '@supermapgis/mapboxgl/components/graph-map'
import { SmCompare } from '@supermapgis/mapboxgl/components/compare'
import { SmAnimateMarkerLayers } from '@supermapgis/mapboxgl/components/animate-marker-layer'
import { SmIdentify } from '@supermapgis/mapboxgl/components/identify'
import { SmLayerList } from '@supermapgis/mapboxgl/components/layer-list'
import { SmMeasure } from '@supermapgis/mapboxgl/components/measure'
import { SmQuery } from '@supermapgis/mapboxgl/components/query'
import { SmSearch } from '@supermapgis/mapboxgl/components/search'

import type { Plugin } from 'vue'

export default [
  SmConfigProvider,
  SmTimeSlider,
  SmTimeText,
  SmAttributes,
  SmWebMap,
  SmGraphMap,
  SmCompare,
  SmAnimateMarkerLayers,
  SmIdentify,
  SmLayerList,
  SmMeasure,
  SmQuery,
  SmSearch,
  SmAttributePanel,
  SmIndicator,
  SmText
] as Plugin[]
