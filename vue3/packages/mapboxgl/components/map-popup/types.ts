import type { PropType } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits } from '@supermapgis/common/utils/index.common'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { AttributePanelProps } from '@supermapgis/common/components/attribute-panel/types'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/components/theme/theme'

export const mapPopupProps = () => ({
  lnglats: {
    type: Array as () => Array<number[]>,
    default: () => []
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  defaultIndex: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ''
  },
  contentSlot: {
    type: String,
    default: ''
  },
  data: {
    type: Array as PropType<Array<Array<Object>>>,
    default: () => []
  },
  columns: {
    type: Array as PropType<Array<Object>>,
    default: () => []
  },
  titleRender: {
    type: Function as PropType<AttributePanelProps['titleRender']>
  },
  valueRender: {
    type: Function as PropType<AttributePanelProps['valueRender']>
  },
  showHeader: {
    type: Boolean,
    default: true
  }
})

// export type MapPopupProps = Partial<ExtractPropTypes<ReturnType<typeof mapPopupProps>>>
export interface MapPopupProps extends ThemeProps, MapGetterProps {
  lnglats?: number[][]
  showIcon?: boolean
  defaultIndex?: number
  title?: string
  contentSlot?: string
  data?: Object[][]
  columns?: Object[]
  showHeader?: boolean
  titleRender?: Function
  valueRender?: Function
}

export const mapPopupPropsDefault = getPropsDefaults<MapPopupProps>(
  Object.assign(themeProps(), mapGetterProps(), mapPopupProps())
)

export type MapPopupEvents = {
  change: [number]
} & MapGetterEvents

export type MapPopupEmits = ShortEmits<MapPopupEvents>

export default mapPopupProps
