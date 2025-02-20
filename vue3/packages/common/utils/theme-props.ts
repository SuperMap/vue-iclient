import type { PropType } from 'vue'

export const themeProps = () => ({
  background: String,
  textColor: String,
  colorGroup: Array as PropType<Array<string>>
})

// export type ThemeProps = Partial<ExtractPropTypes<ReturnType<typeof themeProps>>>
export type ThemeProps = {
  background?: string
  textColor?: string
  colorGroup?: string[]
}

export default themeProps
