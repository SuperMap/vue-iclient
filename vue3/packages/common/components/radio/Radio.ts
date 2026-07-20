import type { RadioProps, RadioGroupProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { Radio } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmRadio = createWrappedComponent<RadioProps>(Radio, 'radio')

export const SmRadioGroup = createWrappedComponent<RadioGroupProps>(
  Radio.Group as any,
  'radio'
)

export const SmRadioButton = defineComponent({
  ...SmRadio.Button,
  name: 'SmRadioButton'
})

export default SmRadio
