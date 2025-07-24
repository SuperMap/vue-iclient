import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/utils/index.common'


export const imageProps = () => ({
  src: {
    type: String
  },
  repeat: {
    type: String,
    default: 'center'
  },
  href: {
    type: String,
    default: ''
  },
  previewMode: {
    type: String,
    default: 'none'
  },
  target: {
    type: String,
    default: '_self'
  }
})

export interface ImageProps extends ThemeProps {
  src?: string,
  repeat?: 'center' | 'left' | 'noRepeat' | 'repeatX' | 'repeatY' | 'repeatXY',
  href?: string,
  previewMode?: 'none' | 'popup' | 'full',
  target?: string
}

export const imagePropsDefault = getPropsDefaults<ImageProps>(Object.assign(themeProps(), imageProps()))

export default imageProps
