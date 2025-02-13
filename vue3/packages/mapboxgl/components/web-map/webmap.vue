<script setup lang="ts">
import { ref } from 'vue'
import { getProjection } from 'vue-iclient-core/utils/epsg-define'
import { xxx } from '@supermapgis/mapboxgl/utils'

defineProps<{
  msg: string
  msg1?: number
}>()
type todoItem = {
  id: string
  done: boolean
  text: string
}
const inputValue = ref('')
const todoItems = ref<todoItem[]>([])
const handleClick = () => {
  if (inputValue.value) {
    todoItems.value.push({
      id: Date.now().toString(),
      done: false,
      text: inputValue.value
    })
    inputValue.value = ''
  }
}
console.log(getProjection('EPSG:3857'), xxx)
</script>

<template>
  <div class="greetings">
    <h1 v-show="msg" :title1="msg" class="green" :title="msg" :title5="msg" @click="e => {}">
      {{ msg }}
    </h1>
    <input v-model="inputValue" />
    <button class="add-button" @click="handleClick">Add ToDo</button>
    <ul class="todo-list">
      <li
        v-for="todo in todoItems"
        :key="todo.id"
        class="todo-item"
        :class="{ 'todo-item--done': todo.done }"
        @click="todo.done = !todo.done"
      >
        <span v-if="todo.done">✓</span>
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>
