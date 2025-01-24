<template>
  <div
    :class="{ 'sm-component-table-popup': true, 'with-split-line': splitLine }"
    :style="[tablePopupBgStyle, getTextColorStyle]"
  >
    <sm-table
      class="sm-component-table-popup__table"
      :data-source="data"
      :columns="columns"
      :rowKey="(record, index) => index"
      :pagination="false"
      :showHeader="showHeader"
    />
  </div>
</template>
<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmTable from 'vue-iclient/src/common/table/Table.vue';
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util';

export default {
  name: 'SmTablePopup',
  components: {
    SmTable
  },
  mixins: [Theme],
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    columns: {
      type: Array,
      default() {
        return [];
      }
    },
    splitLine: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    'collapseCardHeaderBgStyle.background'(next) {
      this.setTheadStyle('background', next);
    },
    'tablePopupBgStyle.background'(next) {
      setPopupArrowStyle(next);
    },
    'headingTextColorStyle.color'(next) {
      this.setTheadStyle('color', next);
    }
  },
  mounted() {
    this.setTheadStyle('color', this.headingTextColorStyle.color);
    this.setTheadStyle('background', this.collapseCardHeaderBgStyle.background);
  },
  methods: {
    setTheadStyle(attr, value) {
      if (!this.$el) {
        return;
      }
      const thList = this.$el.querySelectorAll('tr > th');
      if (thList) {
        thList.forEach(item => {
          item.style[attr] = value;
        });
      }
    }
  }
};
</script>
