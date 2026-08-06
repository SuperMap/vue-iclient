import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * 将外链图片转为 blob URL，请求时使用 no-referrer，规避防盗链（Referer 白名单）导致的加载失败。
 * 同源或已可直接加载的地址会尽量复用原 URL。
 */
export function useNoReferrerImageUrl(source: Ref<string> | (() => string)) {
  const displayUrl = ref('')
  let objectUrl = ''
  let requestId = 0

  const revokeObjectUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = ''
    }
  }

  const resolveSource = () => (typeof source === 'function' ? source() : source.value)

  const load = async (url: string) => {
    const currentId = ++requestId
    revokeObjectUrl()
    if (!url) {
      displayUrl.value = ''
      return
    }

    // 本地 / data / blob 无需处理
    if (
      url.startsWith('blob:') ||
      url.startsWith('data:') ||
      url.startsWith('./') ||
      url.startsWith('/') ||
      url.startsWith('static/')
    ) {
      displayUrl.value = url
      return
    }

    try {
      const response = await fetch(url, {
        referrerPolicy: 'no-referrer',
        mode: 'cors'
      })
      if (!response.ok) {
        throw new Error(`image fetch failed: ${response.status}`)
      }
      const blob = await response.blob()
      if (currentId !== requestId) {
        return
      }
      objectUrl = URL.createObjectURL(blob)
      displayUrl.value = objectUrl
    } catch {
      // CORS 失败时退回原地址，并依赖 img referrerpolicy
      if (currentId === requestId) {
        displayUrl.value = url
      }
    }
  }

  watch(
    resolveSource,
    (url) => {
      void load(url || '')
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    requestId += 1
    revokeObjectUrl()
  })

  return displayUrl
}
