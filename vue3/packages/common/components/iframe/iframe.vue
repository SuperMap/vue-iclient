<template>
  <iframe :src="src" scrolling="auto" class="sm-component-iframe" title=""></iframe>
</template>

<script lang="ts" setup>
import { iframePropsDefault } from './types'
import type { IframeProps } from './types'

defineOptions({
  name: 'SmIframe'
})

withDefaults(defineProps<IframeProps>(), iframePropsDefault)
</script>
