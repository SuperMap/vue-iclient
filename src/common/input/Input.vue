<script lang="ts">
import Input from 'ant-design-vue/es/input/Input';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import {
  shouldTransformArabicNumbers,
  toArabicNumber,
  toLatinNumber
} from 'vue-iclient/src/common/_utils/arabic-number';
import Base from './BaseMixin.vue';

function getEventValue(eventOrValue) {
  return eventOrValue && eventOrValue.target ? eventOrValue.target.value : eventOrValue;
}

function createNormalizedEvent(event, value) {
  const target = event && event.target;
  const currentTarget = event && event.currentTarget;
  return Object.assign({}, event, {
    target: Object.assign({}, target, { value }),
    currentTarget: Object.assign({}, currentTarget, { value })
  });
}

export const inputTypes = {
  ...inputProps,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle']),
  error: VueTypes.bool.def(false),
  unit: VueTypes.string,
  /** RTL 下是否将输入框中的拉丁数字转为阿拉伯数字显示。 */
  transformArabicNumbers: VueTypes.bool.def(true)
};

export default {
  name: 'SmInput',
  defaultComponent: Input,
  mixins: [Base],
  props: inputTypes,
  data() {
    return {
      displayValueState: undefined
    };
  },
  computed: {
    hasValueProp() {
      return Object.prototype.hasOwnProperty.call(this.$options.propsData || {}, 'value');
    },
    shouldUseArabicDigits() {
      return this.transformArabicNumbers && shouldTransformArabicNumbers();
    },
    displayValue() {
      if (this.displayValueState !== undefined) {
        return this.displayValueState;
      }
      const value = this.hasValueProp ? this.value : this.defaultValue;
      return this.formatDisplayValue(value);
    },
    displayPlaceholder() {
      if (this.placeholder === undefined) {
        return this.placeholder;
      }
      return this.shouldUseArabicDigits ? this.formatDisplayValue(this.placeholder) : this.placeholder;
    },
    extralProps() {
      const props: Record<string, any> = {
        size: this.size === 'middle' ? undefined : this.size,
        addonAfter: this.unit || this.addonAfter
      };
      if (this.hasValueProp) {
        props.value = this.displayValue;
      } else if (this.defaultValue !== undefined) {
        props.defaultValue = this.formatDisplayValue(this.defaultValue);
      }
      if (this.placeholder !== undefined) {
        props.placeholder = this.displayPlaceholder;
      }
      return props;
    },
    componentClass() {
      return {
        'sm-component-input-affix-wrapper-md': this.size === 'middle',
        'sm-component-input-error': this.error,
        'sm-component-input-unit': this.unit
      };
    },
    extralListeners() {
      const vm = this;
      return {
        'change.value': function(value) {
          vm.handleValueUpdate(value);
        },
        input: function(event) {
          vm.handleInput(event);
        },
        change: function(event) {
          vm.handleChange(event);
        },
        blur: function(event) {
          vm.handleBlur(event);
        }
      };
    }
  },
  watch: {
    value(value) {
      if (this.hasValueProp) {
        this.displayValueState = this.formatDisplayValue(value);
      }
    },
    shouldUseArabicDigits() {
      const value = this.hasValueProp
        ? this.value
        : this.displayValueState === undefined
          ? this.defaultValue
          : this.displayValueState;
      this.displayValueState = this.formatDisplayValue(value);
    },
    transformArabicNumbers() {
      const value = this.hasValueProp
        ? this.value
        : this.displayValueState === undefined
          ? this.defaultValue
          : this.displayValueState;
      this.displayValueState = this.formatDisplayValue(value);
    }
  },
  methods: {
    normalizeValue(value) {
      return toLatinNumber(value);
    },
    formatDisplayValue(value) {
      const normalizedValue = this.normalizeValue(value);
      return this.shouldUseArabicDigits ? toArabicNumber(normalizedValue) : normalizedValue;
    },
    handleValueUpdate(value) {
      const normalizedValue = this.normalizeValue(value);
      this.displayValueState = this.formatDisplayValue(normalizedValue);
      this.$emit('change.value', normalizedValue);
    },
    handleInput(event) {
      const normalizedValue = this.normalizeValue(getEventValue(event));
      this.displayValueState = this.formatDisplayValue(normalizedValue);
      this.$emit('input', createNormalizedEvent(event, normalizedValue));
    },
    handleChange(event) {
      const normalizedValue = this.normalizeValue(getEventValue(event));
      this.displayValueState = this.formatDisplayValue(normalizedValue);
      this.$emit('change', createNormalizedEvent(event, normalizedValue));
    },
    handleBlur(event) {
      const rawValue = getEventValue(event);
      const value = this.normalizeValue(rawValue == null ? this.displayValue : rawValue);
      const displayValue = this.hasValueProp && this.value != null ? this.value : value;
      this.displayValueState = this.formatDisplayValue(displayValue);
      this.$emit('blur', event);
    }
  },
  mounted() {
    if (this.size === 'middle') {
      const inputDom = this.$el.querySelector('.sm-component-input');
      inputDom && inputDom.classList && inputDom.classList.add('sm-component-input-md');
    }
  }
};
</script>
