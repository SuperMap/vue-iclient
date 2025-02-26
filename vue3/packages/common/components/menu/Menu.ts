import type { MenuProps, MenuItemProps, SubMenuProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { Menu as AMenu, MenuItem as AMenuItem, SubMenu as ASubMenu } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmMenu = createWrappedComponent<MenuProps>(AMenu)

export const SmMenuItem = defineComponent<MenuItemProps>({
  ...AMenuItem,
  name: 'SmMenuItem'
})

export const SmSubMenu = defineComponent<SubMenuProps>({
  ...ASubMenu,
  name: 'SmSubMenu'
})

export default SmMenu
