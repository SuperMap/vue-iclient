import type { PropType, CSSProperties } from 'vue'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import type { ThirdServiceProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import { thirdServiceProps, themeProps } from '@supermapgis/common/utils/index.common'


export const textProps = () => ({
  fontStyle: Object as PropType<CSSProperties>,
  title: String,
  href: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    default: '_self'
  }
})

export interface TextProps extends ThemeProps, ThirdServiceProps{
  fontStyle?: CSSProperties,
  title?: string | number,
  href?: string,
  target?: string
}

export const textPropsDefault = getPropsDefaults<TextProps>(Object.assign(themeProps(), thirdServiceProps(), textProps()))

export default textProps
