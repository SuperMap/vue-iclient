import type { CardProps } from 'ant-design-vue'
import { Card as ACard } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmCard = createWrappedComponent<CardProps>(ACard)

export default SmCard
