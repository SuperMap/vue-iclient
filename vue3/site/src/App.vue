<script setup>
import { WebMapDemo, AttributesDemo } from './register-components'
</script>

<template>
  <Fragement>
    <WebMapDemo server-url="http://172.16.14.44:8190/iportal" :map-id="692091022"></WebMapDemo>
    <AttributesDemo></AttributesDemo>
  </Fragement>
</template>

<style scoped></style>
