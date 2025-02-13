<script setup lang="ts">
defineProps<{
  msg: string
  msg1?: number
}>()
</script>

<template>
  <div class="greetings">HELLO{{ msg }}</div>
</template>
