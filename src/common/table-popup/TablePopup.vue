<template>
  <div class="sm-component-table-popup" :style="[getBackgroundStyle, getTextColorStyle, styleObject]">
    <a-table
      class="sm-component-table-popup__table"
      :data-source="data"
      :columns="columns"
      :rowKey="(record, index) => index"
      :pagination="false"
      :style="getBackgroundStyle"
    ></a-table>
  </div>
</template>
<script>
import Theme from '../_mixin/theme';

export default {
  name: 'SmTablePopup',
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
    }
  },
  computed: {
    styleObject() {
      return {
        '--table-popup-active-color--text': this.colorGroupsData[0]
      };
    }
  }
};
</script>
