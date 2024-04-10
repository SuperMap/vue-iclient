<template>
  <span class="sm-component-legend__fieldvalue add-ellipsis">
    {{ fieldLabel }}
  </span>
</template>

<script>
export default {
  props: {
    styleData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    fieldLabel() {
      if ('fieldValue' in this.styleData) {
        return this.styleData.fieldValue ?? this.$t('legend.themeDefault');
      }
      return this.rangeLabel;
    },
    rangeLabel() {
      const { start, end, integerType } = this.styleData;
      if (!start && !end) {
        return this.$t('legend.outOfRange');
      }
      if (start && end) {
        if (integerType) {
          return this.getIntegerRangeInfo(start, end);
        }
        return `${start} - ${end}`;
      }
      return start !== undefined ? `≥${start}` : `≤${end}`;
    }
  },
  methods: {
    getIntegerRangeInfo(start, end) {
      if (end - 1 === start || end === start) {
        return `${start}`;
      }
      return `${start} - ${end - 1}`;
    }
  }
};
</script>
