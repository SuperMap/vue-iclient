import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'
import type { PropType } from 'vue'

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
  options: {
    type: Object as PropType<cesiumOptions>
  },
  target: {
    type: String,
    default: 'scene'
  },
  flyAnimation: {
    type: Boolean
  },
  sceneLayerListControl: {
    type: Object, 
  }
})

// export type WebSceneProps = Partial<ExtractPropTypes<ReturnType<typeof webSceneProps>>>
export type WebSceneProps = {
  sceneUrl?: string
  widgetsPath?: string
  cesiumPath?: string
  options?: cesiumOptions
  target?: string
  flyAnimation?: boolean
}

export const webScenePropsDefault = getPropsDefaults<WebSceneProps>(webSceneProps())


export type WebSceneEvents = {
  'viewer-position-changed':[{orientation?:Object, destination?:Object}],
  'viewer-scan-position-changed' :[any],
  'instance-did-load': [{Cesium:any, viewer:any}]
}

export type WebSceneEmits = ShortEmits<WebSceneEvents>

export default webSceneProps
