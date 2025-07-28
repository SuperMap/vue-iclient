import type { CardProps } from 'ant-design-vue'
import { Card } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmCard = createWrappedComponent<CardProps>(Card, 'card')

export default SmCard
