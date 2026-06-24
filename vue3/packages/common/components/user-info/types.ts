import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/utils/index.common'

export interface UserInfoProps extends ThemeProps {
  rootUrl: string
  showIcon?: boolean
  showName?: boolean
}

export const userInfoProps = () => ({
  rootUrl: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showName: {
    type: Boolean,
    default: true
  }
})

export const userInfoPropsDefault = getPropsDefaults<UserInfoProps>(
  Object.assign(themeProps(), userInfoProps())
)

export default userInfoProps
