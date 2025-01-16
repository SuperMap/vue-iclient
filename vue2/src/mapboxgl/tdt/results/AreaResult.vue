<template>
  <div v-if="data" class="area-results-container sm-component-tdtAreaResults">
    <div class="title">
      <i />
      {{ $t('tdtResults.switchTo') }}
      <span class="name">{{ data.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AreaResult',
  props: {
    data: {
      type: Object
    }
  }
};
</script>
