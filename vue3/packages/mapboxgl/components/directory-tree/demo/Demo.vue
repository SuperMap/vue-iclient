<script setup lang="ts">
import DirectoryTree from '../directory-tree.vue'
import '../style'

const TREE_SCHEMA = {
  version: '1.0.0',
  directoryCheckable: true,
  nodes: [
    {
      id: 'semantic-root',
      title: 'Planning Resources',
      children: [
        {
          type: 'resource-search',
          id: 'query-services',
          title: 'Published Services',
          params: {
            resourceType: 'SERVICE',
            text: 'WMS'
          }
        },
        {
          type: 'resource-directory',
          id: 'portal-maps',
          title: 'Portal Maps',
          directoryId: 1
        }
      ]
    }
  ]
}
</script>

<template>
  <DirectoryTree :treeSchema="TREE_SCHEMA" />
</template>

