import type { SliderProps } from 'ant-design-vue'
import { Slider } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmSlider = createWrappedComponent<SliderProps>(Slider, 'slider')

export default SmSlider
