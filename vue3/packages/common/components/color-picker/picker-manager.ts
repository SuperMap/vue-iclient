import { ref } from 'vue'

export const activeColorPickerId = ref<number>()

let pickerId = 0

export function createColorPickerId() {
  pickerId += 1
  return pickerId
}
