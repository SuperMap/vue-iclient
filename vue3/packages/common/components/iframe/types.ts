import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'


export const iframeProps = () => ({
  src: {
    type: String
  }
})

export interface IframeProps {
  src?: string
}

export const iframePropsDefault = getPropsDefaults<IframeProps>(iframeProps())

export default iframeProps
