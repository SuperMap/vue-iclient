import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'
import type { PropType } from 'vue'
import type { LayerCheckData } from 'vue-iclient-core/utils/scene'

interface scanEffect {
  status?: boolean;
  type?: 'circle' | 'noScan' | 'line';
  centerPostion?: { x: number; y: number; z: number } | Object;
  period?: number;
  speed?: number;
}
interface cesiumOptions {
  withCredentials?: boolean;
  orientation?: any;
  position?: Object;
  scanEffect?: scanEffect;
  tiandituOptions?: Object;
}

export const webSceneProps = () => ({
  sceneUrl: {
    type: String
  },
  widgetsPath: {
    type: String
  },
  cesiumPath: {
    type: String
  },
  openConfigPath: {
    type: String
  },
  options: {
    type: Object as PropType<cesiumOptions>
  },
  target: {
    type: String,
    default: 'scene'
  },
  layers: {
    type: Array as PropType<LayerCheckData[]>,
    default: () => []
  },
  flyAnimation: {
    type: Boolean
  },
  sceneLayerListControl: {
    type: Object, 
  },
  sceneLayerManagerControl: {
    type: Object,
  },
  sceneFlyToControl: {
    type: Object,
  },
  sceneFullscreenControl: {
    type: Object,
  },
  sceneMeasureControl: {
    type: Object, 
  },
  sceneViewModeSwitcherControl: {
    type: Object,
  },
  sceneZoomControl: {
    type: Object,
  },
  sceneMapSwitchControl: {
    type: Object,
  },
  sceneSkylineAnalysisControl: {
    type: Object,
  },
  sceneSplitScreenControl: {
    type: Object,
  },
  sceneSunlightAnalysisControl: {
    type: Object,
  },
  sceneRollerShutterControl: {
    type: Object,
  },
  sceneAttributePopupControl: {
    type: Object,
  }
})

// export type WebSceneProps = Partial<ExtractPropTypes<ReturnType<typeof webSceneProps>>>
export type WebSceneProps = {
  sceneUrl?: string
  widgetsPath?: string
  cesiumPath?: string
  openConfigPath?: string
  options?: cesiumOptions
  target?: string
  layers?: LayerCheckData[]
  flyAnimation?: boolean
  sceneLayerListControl?: Object
  sceneLayerManagerControl?: object
  sceneFlyToControl?: Object
  sceneFullscreenControl?: Object
  sceneMeasureControl?: Object
  sceneViewModeSwitcherControl?: Object
  sceneZoomControl?: Object
  sceneMapSwitchControl?: Object
  sceneSkylineAnalysisControl?: Object
  sceneSplitScreenControl?: Object
  sceneSunlightAnalysisControl?: Object
  sceneRollerShutterControl?: Object
  sceneAttributePopupControl?: Object
}

export const webScenePropsDefault = getPropsDefaults<WebSceneProps>(webSceneProps())


export type WebSceneEvents = {
  'viewer-position-changed':[{orientation?:Object, destination?:Object}],
  'viewer-scan-position-changed' :[any],
  'instance-did-load': [{Cesium:any, viewer:any}]
}

export type WebSceneEmits = ShortEmits<WebSceneEvents>

export default webSceneProps
