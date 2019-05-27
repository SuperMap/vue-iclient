<template>
  <div class="sm-table-popup">
    <a-table
      :data-source="data"
      :columns="columns"
      :rowKey="(record, index) => index"
      :pagination="false"
    >
    </a-table>
  </div>
</template>
<script>
export default {
  name: 'SmTabelPopup',
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
  }
};
</script>
<style lang='scss'>
.ant-table-wrapper {
  margin: 12px 0;
  .ant-table-content{
    max-height: 250px;
    overflow: auto;
  }
}
</style>
