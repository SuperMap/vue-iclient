import type { ShallowRef } from 'vue'
import { addListener, removeListener } from 'resize-detector'
import { onMounted, onBeforeUnmount } from 'vue'

export const useResizeHooks = (ref: ShallowRef<any>, callback: () => void) => {
  onMounted(() => {
    addListener(ref.value.$el, callback)
  })

  onBeforeUnmount(() => {
    removeListener(ref.value.$el, callback)
  })
}
