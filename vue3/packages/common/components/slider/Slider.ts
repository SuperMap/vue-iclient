import type { SliderProps } from 'ant-design-vue'
import { Slider as ASlider } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmSlider = createWrappedComponent<SliderProps>(ASlider)

export default SmSlider
