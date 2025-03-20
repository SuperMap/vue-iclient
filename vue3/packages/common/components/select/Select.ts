import type { SelectProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { Select } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

interface SelectOptionProps {
  key?: string; 
  title?: string;
  value?: string | number;
  disabled?: boolean;
  [prop: string]: any;
}

interface SelectOptGroupProps {
  key?: string; 
  label?: string;
  [prop: string]: any;
}

const SmSelect = createWrappedComponent<SelectProps>(Select, 'select')

export const SmSelectOption = defineComponent<SelectOptionProps>({
  ...SmSelect.Option,
  name: 'SmSelectOption'
})

export const SmSelectOptGroup = defineComponent<SelectOptGroupProps>({
  ...SmSelect.OptGroup,
  name: 'SmSelectOptGroup'
})

export default SmSelect
