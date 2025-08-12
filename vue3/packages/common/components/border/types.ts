import type { PropType } from 'vue'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/utils/index.common'

export interface BorderConfig {
  borderEdge: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  borderWidth: number[];
  src?: string;
}

export const borderProps = () => ({
  type: {
    type: [String],
    default: 'border1'
  },
 customBorder: {
    type: Object as PropType<BorderConfig>
  }
})

export interface BorderProps extends ThemeProps {
  type?: string,
  customBorder?: BorderConfig
}

export const borderPropsDefault = getPropsDefaults<BorderProps>(Object.assign(themeProps(), borderProps()))

export default borderProps
