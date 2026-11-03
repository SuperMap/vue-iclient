<script lang="ts">
import InputNumber, { InputNumberProps } from 'ant-design-vue/es/input-number';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import {
  shouldTransformArabicNumbers,
  toArabicNumber,
  toLatinNumber
} from 'vue-iclient/src/common/_utils/arabic-number';
import Base from 'vue-iclient/src/common/input/BaseMixin.vue';

function normalizeChangeValue(value) {
  if (value === null || value === undefined || typeof value === 'number') {
    return value;
  }
  return toLatinNumber(value);
}

export const inputNumberTypes = {
  ...InputNumberProps,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle']),
  error: VueTypes.bool.def(false),
  /** RTL 下是否将数字输入框中的拉丁数字转为阿拉伯数字显示。 */
  transformArabicNumbers: VueTypes.bool.def(true)
};

export default {
  name: 'SmInputNumber',
  defaultComponent: InputNumber,
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: inputNumberTypes,
  computed: {
    shouldUseArabicDigits() {
      return this.transformArabicNumbers && shouldTransformArabicNumbers();
    },
    extralListeners() {
      const vm = this;
      return {
        // 这里确保组件配合 `v-model` 的工作
        change: function(value) {
          vm.$emit('change', normalizeChangeValue(value));
        }
      };
    },
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size,
        formatter: (value, info) => {
          const rawText = this.formatter
            ? this.formatter(value, info)
            : info && info.userTyping
              ? info.input
              : `${value == null ? '' : value}`;
          return this.shouldUseArabicDigits ? toArabicNumber(rawText) : rawText;
        },
        parser: value => {
          const normalizedText = toLatinNumber(value == null ? '' : value);
          return this.parser ? this.parser(normalizedText) : normalizedText;
        }
      };
    },
    componentClass() {
      return {
        'sm-component-input-number-md': this.size === 'middle',
        'sm-component-input-number-error': this.error === true
      };
    }
  }
};
</script>
