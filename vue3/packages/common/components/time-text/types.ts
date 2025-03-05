import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const timeTextProps = () => ({
  timeType: {
    type: String,
    default: 'date'
  },
  fontStyle: {
    type: Object
  }
})

export interface TimeTextProps extends ThemeProps {
  timeType?: string,
  fontStyle?: Object
}

export const timeTextPropsDefault = getPropsDefaults<TimeTextProps>(Object.assign(themeProps(), timeTextProps()))

export default timeTextProps
