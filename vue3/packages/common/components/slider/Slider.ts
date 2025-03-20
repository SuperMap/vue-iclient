import type { SliderProps } from 'ant-design-vue'
import { Slider } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmSlider = createWrappedComponent<SliderProps>(Slider, 'slider')

export default SmSlider
