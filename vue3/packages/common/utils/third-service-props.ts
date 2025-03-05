import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const thirdServiceProps = () => ({
  url: {
    type: String,
    default: ''
  },
  field: {
    type: String,
    default: ''
  },
  proxy: {
    type: String,
    default: ''
  }
})

export type ThirdServiceProps = {
  url?: string,
  field?: string,
  proxy?: string
}

export const thirdServicePropsDefault = getPropsDefaults<ThirdServiceProps>(thirdServiceProps())

export default thirdServiceProps