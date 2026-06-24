import type { TooltipProps } from 'ant-design-vue'
import { Tooltip } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmTooltip = createWrappedComponent<TooltipProps>(Tooltip, 'tooltip')

export default SmTooltip

