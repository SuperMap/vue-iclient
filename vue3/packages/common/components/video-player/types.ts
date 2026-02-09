import type { PropType } from 'vue'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/utils/index.common'

export interface PlayerOptions {
  height?: number
  width?: number
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  fluid?: boolean
  language?: string
  playbackRates?: Array<number>
  controls?: boolean
  sources?: Array<{ type?: string; src: string }>
  preload?: string
  poster?: string
  controlBar?: any
  notSupportedMessage?: string
  suppressNotSupportedError?: boolean
  techOrder?: Array<string>
  flash?: any
  flvjs?: any
}

export interface VideoPlayerOptions {
  muted?: boolean
  loop?: boolean
  autoplay?: boolean
  controls?: boolean
  poster?: string
  fill?: boolean
}
export enum Ratio {
  Ratio = 'ratio',
  Full = 'full'
}
export enum PreviewMode {
  Default ='default',
  Fullscreen = 'fullScreen',
  PopupToPlay = 'popupToPlay'
}

export const videoPlayerProps = () => ({
  url: {
    type: String,
    required: false
  },
  previewMode: {
    type: String as PropType<PreviewMode>,
    default: PreviewMode.Default
  },
  ratio: {
    type: String as PropType<Ratio>,
    default: Ratio.Ratio
  },
  options: {
    type: Object as PropType<VideoPlayerOptions>,
    default: () => {
      return {
        muted: true,
        loop: false,
        autoplay: false,
        controls: true,
        fill: false,
        poster: ''
      }
    }
  }
})

export interface VideoPlayerProps extends ThemeProps {
  url: string
  previewMode?: string
  ratio?: Ratio
  options?: VideoPlayerOptions
}

export const videoPlayerPropsDefault = getPropsDefaults<VideoPlayerProps>(
  Object.assign(themeProps(), videoPlayerProps())
)

export default videoPlayerProps
