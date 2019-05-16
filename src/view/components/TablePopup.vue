<template>
  <div class="sm-table-popup">
    <el-table
      :data="state.data"
      :max-height="300"
    >
      <el-table-column
        v-for="(column,index) in state.columns"
        :key="index"
        :prop="column.prop"
        :width="column.width || 150"
        :label="column.label"
      ></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'SmTabelPopup',
  props: {
    state: {
      type: Object
    }
  }
};
</script>
<style lang='scss'>
.el-table {
  margin-top: 6px;
  .el-table__body-wrapper {
    max-height: 250px !important;
    overflow: auto !important;
  }
}
</style>
