import type { InputNumberProps } from 'ant-design-vue'
import { InputNumber } from 'ant-design-vue'
import {
  computed,
  defineComponent,
  h,
  ref,
  useAttrs,
  useSlots,
  type PropType
} from 'vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'
import { useArabicDigits } from '@supermapgis/common/hooks/index.common'
import { toLatinNumber } from '@supermapgis/common/utils/index.common'

const BaseSmInputNumber = createWrappedComponent<InputNumberProps>(InputNumber, 'input-number')

export const SmInputNumber = defineComponent({
  name: 'SmInputNumber',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number] as PropType<string | number | null>,
      default: undefined
    },
    /**
     * RTL 下是否将数字输入框中的拉丁数字转为阿拉伯数字显示；
     * parser 会先归一为拉丁数字再交给业务。
     */
    transformArabicNumbers: {
      type: Boolean,
      default: true
    },
    formatter: {
      type: Function as PropType<InputNumberProps['formatter']>,
      default: undefined
    },
    parser: {
      type: Function as PropType<InputNumberProps['parser']>,
      default: undefined
    }
  },
  emits: ['update:value', 'change', 'blur', 'focus', 'pressEnter', 'step'],
  setup(props, { emit, expose }) {
    const attrs = useAttrs()
    const slots = useSlots()
    const controlRef = ref<any>(null)

    const { shouldUseArabicDigits, toArabicNumber } = useArabicDigits(
      () => props.transformArabicNumbers
    )

    const formatNumberDisplay: NonNullable<InputNumberProps['formatter']> = (value, info) => {
      const rawText = props.formatter
        ? props.formatter(value, info)
        : info.userTyping
          ? info.input
          : `${value ?? ''}`
      return shouldUseArabicDigits.value ? toArabicNumber(rawText) : rawText
    }

    const parseNumberDisplay: NonNullable<InputNumberProps['parser']> = (displayValue) => {
      const normalizedText = toLatinNumber(displayValue ?? '')
      return props.parser ? props.parser(normalizedText) : normalizedText
    }

    const restAttrs = computed(() => {
      const rest = { ...(attrs as Record<string, unknown>) }
      delete rest.formatter
      delete rest.parser
      delete rest['onUpdate:value']
      return rest
    })

    function handleChange(value: string | number | null) {
      emit('update:value', value)
      emit('change', value)
    }

    function handleBlur(event: FocusEvent) {
      emit('blur', event)
    }

    function handleFocus(event: FocusEvent) {
      emit('focus', event)
    }

    function handlePressEnter(event: KeyboardEvent) {
      emit('pressEnter', event)
    }

    function handleStep(value: string | number, info: unknown) {
      emit('step', value, info)
    }

    function focus() {
      controlRef.value?.focus?.()
    }

    function blur() {
      controlRef.value?.blur?.()
    }

    expose({ focus, blur })

    return () =>
      h(
        BaseSmInputNumber,
        {
          ...restAttrs.value,
          ref: controlRef,
          value: props.value,
          formatter: formatNumberDisplay,
          parser: parseNumberDisplay,
          'onUpdate:value': handleChange,
          onChange: handleChange,
          onBlur: handleBlur,
          onFocus: handleFocus,
          onPressEnter: handlePressEnter,
          onStep: handleStep
        },
        slots
      )
  }
}) as any

export default SmInputNumber
