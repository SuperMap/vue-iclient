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
import { SmZoom } from '@supermapgis/mapboxgl/components/zoom'
import { SmDraw } from '@supermapgis/mapboxgl/components/draw'
import { SmCompass } from '@supermapgis/mapboxgl/components/compass'
import { SmMiniMap } from '@supermapgis/mapboxgl/components/mini-map'
import { SmPan } from '@supermapgis/mapboxgl/components/pan'
import { SmScale } from '@supermapgis/mapboxgl/components/scale'
import { SmSceneLayerList } from '@supermapgis/mapboxgl/components/scene-layer-list'
import { SmWebScene } from '@supermapgis/mapboxgl/components/web-scene'
import { SmTextList } from '@supermapgis/mapboxgl/components/text-list'

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
  SmText,
  SmZoom,
  SmDraw,
  SmCompass,
  SmMiniMap,
  SmPan,
  SmScale,
  SmSceneLayerList,
  SmWebScene,
  SmTextList
] as Plugin[]
