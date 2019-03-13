<template>
  <div class="sm-table-popup">
    <el-table :data="state.data" :max-height="300">
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
  props: ["state"],
  name: "SmTabelPopup"
};
</script>
<style lang='scss'>
.el-table__body-wrapper {
  overflow: auto !important;
}
</style>
