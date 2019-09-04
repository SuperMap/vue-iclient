<template>
  <div v-if="data" class="area-results-container">
    <div class="title">
      <i />
      已切换到
      <span class="name">{{ data.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AreaResult',
  inheritAttrs: false,
  props: {
    data: {
      type: Object
    }
  }
};
</script>

<style lang="scss" scoped>
.area-results-container {
  padding: 20px 0;
  .title {
    text-align: center;
  }
  i {
    display: inline-block;
    background: url('../../../../static/images/sprite.png') -485px -152px no-repeat;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    vertical-align: top;
  }
  .name {
    color: #333;
    font-weight: 700;
    margin-left: 2px;
  }
}
</style>
