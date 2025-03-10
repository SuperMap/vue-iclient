import type { MenuProps, MenuItemProps, SubMenuProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { Menu, MenuItem, SubMenu } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmMenu = createWrappedComponent<MenuProps>(Menu, 'menu')

export const SmMenuItem = defineComponent<MenuItemProps>({
  ...MenuItem,
  name: 'SmMenuItem'
})

export const SmSubMenu = defineComponent<SubMenuProps>({
  ...SubMenu,
  name: 'SmSubMenu'
})

export default SmMenu
