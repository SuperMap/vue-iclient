import { vi } from 'vitest'
import mapboxgl from './mocks/mapboxgl'
import G2 from './mocks/g2'

// 模拟浏览器URL API，因为JSDOM环境中没有实现这些函数
if (!window.URL.createObjectURL) {
  global.URL.createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}#t=${Date.now()}`)
  window.URL.revokeObjectURL = vi.fn()
}

if (!window.Worker) {
  global.Worker = class Worker {
    constructor(scriptURL: string, options?: WorkerOptions) {
      this.scriptURL = scriptURL
      this.options = options
      this.postMessage = vi.fn()
      this.terminate = vi.fn()
      this.addEventListener = vi.fn()
      this.removeEventListener = vi.fn()
      this.dispatchEvent = vi.fn()
    }
    
    scriptURL: string
    options?: WorkerOptions
    postMessage: (message: any, transfer?: Transferable[]) => void
    terminate: () => void
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void
    dispatchEvent: (event: Event) => boolean
  }
}

vi.mock('mapbox-gl', () => {
  return {
    default: mapboxgl,
    ...mapboxgl
  }
})

vi.mock('@antv/g2', () => {
  return {
    default: G2,
    ...G2
  }
})
