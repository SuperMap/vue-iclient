import type { DefineComponent } from 'vue'
import type { ConfigProviderProps } from 'ant-design-vue'
import { defineComponent, h, computed } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import { useTheme } from './hooks/useTheme'

// 定义一个函数来生成包裹组件的渲染函数
export const createWrappedComponent = <T>(
  Component: DefineComponent<T>,
  configProps?: ConfigProviderProps
) => {
  const componentName = Component.name
  const nextName = `Sm${componentName}`
  return defineComponent<T>({
    // 继承原组件的所有属性和方法
    ...Component,
    // 设置新的组件名称
    name: nextName,
    setup(props: T, ctx) {
      try {
        const prefixCls = 'sm-component'

        const { themeToken, specifiedToken } = useTheme(props)

        const comptsTheme = computed<ConfigProviderProps['theme']>(() => {
          if (specifiedToken.value) {
            return {
              components: {
                [componentName]: specifiedToken.value
              }
            }
          }
        })

        const customThemToken = computed<ConfigProviderProps['theme']>(() => {
          return { token: Object.assign({}, themeToken.value) }
        })

        const themeConfig = computed<ConfigProviderProps>(() => {
          return {
            prefixCls,
            ...configProps,
            theme: { ...customThemToken.value, ...comptsTheme.value }
          }
        })

        return () => {
          return h(ConfigProvider, themeConfig.value, {
            default: () =>
              h(
                Component,
                {
                  ...props,
                  ...ctx.attrs
                },
                ctx.slots
              )
          })
        }
      } catch (error) {
        console.error(`Error in setup of ${nextName}:`, error)
        return null
      }
    }
  })
}
