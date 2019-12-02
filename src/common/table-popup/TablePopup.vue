<template>
  <div class="sm-component-table-popup" :style="[backgroundStyle, getTextColorStyle, styleObject]">
    <a-table
      class="sm-component-table-popup__table"
      :data-source="data"
      :columns="columns"
      :rowKey="(record, index) => index"
      :pagination="false"
      :style="backgroundStyle"
    ></a-table>
  </div>
</template>
<script>
import Theme from '../_mixin/theme';
import { getColorWithOpacity } from '../_utils/util';

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
    },
    backgroundStyle() {
      return { background: this.backgroundData ? getColorWithOpacity(this.backgroundData, 0.5) : this.backgroundData };
    }
  }
};
</script>
