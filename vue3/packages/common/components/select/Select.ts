import type { SelectProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { Select, SelectOption, SelectOptGroup } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

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

const SmSelect = createWrappedComponent<SelectProps>(Select)

export const SmSelectOption = defineComponent<SelectOptionProps>({
  ...SelectOption,
  name: 'SmSelectOption'
})

export const SmSelectOptGroup = defineComponent<SelectOptGroupProps>({
  ...SelectOptGroup,
  name: 'SmSelectOptGroup'
})

export default SmSelect
