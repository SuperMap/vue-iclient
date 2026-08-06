import type { InputProps } from 'ant-design-vue'
import { Input } from 'ant-design-vue'
import {
  computed,
  defineComponent,
  h,
  ref,
  useAttrs,
  useSlots,
  watch,
  type PropType
} from 'vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'
import { useArabicDigits } from '@supermapgis/common/hooks/index.common'

const BaseSmInput = createWrappedComponent<InputProps>(Input, 'input')
const BaseSmInputSearch = createWrappedComponent<InputProps>(Input.Search, 'input')
const BaseSmInputTextArea = createWrappedComponent<InputProps>(Input.TextArea, 'input')

type SmInputValue = string | number | undefined | null

const smInputProps = {
  value: {
    type: [String, Number] as PropType<SmInputValue>,
    default: undefined
  },
  placeholder: {
    type: String,
    default: undefined
  },
  /**
   * RTL 下是否将输入框中的拉丁数字转为阿拉伯数字显示；
   * 对外 emit / 业务值始终归一为拉丁数字。
   * 设为 false 可关闭转换（如密码、编码等场景）。
   */
  transformArabicNumbers: {
    type: Boolean,
    default: true
  },
  search: {
    type: Boolean,
    default: false
  },
  textArea: {
    type: Boolean,
    default: false
  }
}

function createNormalizedEvent(event: Event, latinValue: string) {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return event
  }
  return {
    ...event,
    target: {
      ...target,
      value: latinValue
    },
    currentTarget: {
      ...(event.currentTarget as HTMLInputElement | null),
      value: latinValue
    }
  }
}

function createArabicInputComponent(
  name: string,
  BaseComponent: ReturnType<typeof createWrappedComponent>,
  defaults?: { search?: boolean; textArea?: boolean }
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: smInputProps,
    emits: ['update:value', 'change', 'input', 'blur', 'focus', 'pressEnter', 'search'],
    setup(props, { emit, expose }) {
      const attrs = useAttrs()
      const slots = useSlots()
      const controlRef = ref<any>(null)

      const { shouldUseArabicDigits, normalizeValue, formatDisplayValue } = useArabicDigits(
        () => props.transformArabicNumbers
      )

      const modelValue = ref(formatDisplayValue(props.value))

      const displayPlaceholder = computed(() => {
        if (props.placeholder === undefined) {
          return props.placeholder
        }
        return shouldUseArabicDigits.value
          ? formatDisplayValue(props.placeholder)
          : props.placeholder
      })

      watch(
        [() => props.value, shouldUseArabicDigits],
        ([next]) => {
          const nextDisplayValue = formatDisplayValue(next)
          if (nextDisplayValue !== modelValue.value) {
            modelValue.value = nextDisplayValue
          }
        }
      )

      const controlTag = computed(() => {
        if (props.search || defaults?.search) {
          return BaseSmInputSearch
        }
        if (props.textArea || defaults?.textArea) {
          return BaseSmInputTextArea
        }
        return BaseComponent
      })

      function syncDisplayFromRaw(raw: SmInputValue) {
        const normalizedValue = normalizeValue(raw)
        modelValue.value = formatDisplayValue(normalizedValue)
        return normalizedValue
      }

      function handleValueUpdate(value: SmInputValue) {
        const normalizedValue = syncDisplayFromRaw(value)
        emit('update:value', normalizedValue)
        // 兼容 Search 等只监听 @input 的用法
        emit('input', { target: { value: normalizedValue } })
      }

      function handleChange(event: Event) {
        const target = event?.target as HTMLInputElement | undefined
        const normalizedValue = syncDisplayFromRaw(target?.value ?? modelValue.value)
        emit('update:value', normalizedValue)
        emit('change', createNormalizedEvent(event, normalizedValue))
      }

      function handleBlur(event: FocusEvent) {
        const target = event?.target as HTMLInputElement | undefined
        const value = normalizeValue(target?.value ?? modelValue.value)
        modelValue.value = formatDisplayValue(props.value ?? value)
        emit('blur', event)
      }

      function handleFocus(event: FocusEvent) {
        emit('focus', event)
      }

      function handlePressEnter(event: KeyboardEvent) {
        emit('pressEnter', event)
      }

      function handleSearch(value: SmInputValue, event?: Event) {
        const normalizedValue = syncDisplayFromRaw(value)
        emit('update:value', normalizedValue)
        emit('search', normalizedValue, event)
      }

      function focus() {
        controlRef.value?.focus?.()
        const inputElement =
          controlRef.value?.input ?? controlRef.value?.resizableTextArea?.textArea
        inputElement?.focus?.()
      }

      function blur() {
        controlRef.value?.blur?.()
        const inputElement =
          controlRef.value?.input ?? controlRef.value?.resizableTextArea?.textArea
        inputElement?.blur?.()
      }

      expose({ focus, blur })

      return () => {
        const restAttrs = { ...(attrs as Record<string, unknown>) }
        // 由本组件接管，避免与内部阿拉伯数字处理冲突
        delete restAttrs.value
        delete restAttrs.placeholder
        delete restAttrs['onUpdate:value']
        delete restAttrs.onChange
        delete restAttrs.onInput
        delete restAttrs.onBlur
        delete restAttrs.onFocus
        delete restAttrs.onPressEnter
        delete restAttrs.onSearch

        return h(
          controlTag.value,
          {
            ...restAttrs,
            ref: controlRef,
            value: modelValue.value,
            placeholder: displayPlaceholder.value,
            'onUpdate:value': handleValueUpdate,
            onChange: handleChange,
            onBlur: handleBlur,
            onFocus: handleFocus,
            onPressEnter: handlePressEnter,
            onSearch: handleSearch
          },
          slots
        )
      }
    }
  })
}

export const SmInput = createArabicInputComponent('SmInput', BaseSmInput) as any
export const SmInputSearch = createArabicInputComponent('SmInputSearch', BaseSmInputSearch, {
  search: true
}) as any
export const SmInputTextArea = createArabicInputComponent('SmInputTextArea', BaseSmInputTextArea, {
  textArea: true
}) as any

SmInput.Search = SmInputSearch
SmInput.TextArea = SmInputTextArea

export default SmInput
