import type { RowProps, ColProps } from 'ant-design-vue'
import Row from './Row'
import Col from './Col'

export const rowProps = () => Row.props
export const colProps = () => Col.props

export { RowProps, ColProps }