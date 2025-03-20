import type { ComponentObjectPropsOptions } from 'vue'
import type { ConfigProviderProps } from 'ant-design-vue'
import { defineComponent, h, computed } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import { useTheme } from '../../hooks/useTheme'

// 定义需要特殊处理的 antd 组件列表
const specialComponents = ['Select', 'Breadcrumb'] as const

type SpecialComponentName = (typeof specialComponents)[number] & string

function getSpecialComponentOptions(name: SpecialComponentName) {
  switch (name) {
    case 'Select':
      return {
        isSelectOption: true
      }
    case 'Breadcrumb':
      return {
        __ANT_BREADCRUMB_ITEM: true
      }
    default:
      return {}
  }
}

const ConfigProviderStyle = {
  width: 0,
  height: 0,
  padding: 0,
  margin: 0,
  display: 'none'
}

const getConfigProviderWrapper = (name: string) =>
  defineComponent({
    ...(ConfigProvider as ReturnType<typeof defineComponent>),
    name: 'SmConfigProviderWrapper',
    ...getSpecialComponentOptions(name as SpecialComponentName)
  })

// 定义一个函数来生成包裹组件的渲染函数
export const createWrappedComponent = <
  TypeProps,
  RuntimePropsOptions extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(
  Component: ReturnType<typeof defineComponent>,
  className: string,
  configProps?: ConfigProviderProps
) => {
  const componentName = Component.name.replace('A', '')
  const nextName = `Sm${componentName}`
  return defineComponent<TypeProps, RuntimePropsOptions>({
    // 继承原组件的所有属性和方法
    ...Component,
    // 设置新的组件名称
    name: nextName,
    setup(props, ctx) {
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

      const customPrefixCls = `${prefixCls}-${className}`
      return () => {
        return h(
          Component,
          {
            ...props,
            ...ctx.attrs,
            prefixCls: customPrefixCls
          },
          {
            ...ctx.slots,
            default: () => [
              ctx.slots.default?.(),
              h(getConfigProviderWrapper(componentName), {
                ...themeConfig.value,
                style: ConfigProviderStyle
              })
            ]
          }
        )
      }
    }
  })
}
