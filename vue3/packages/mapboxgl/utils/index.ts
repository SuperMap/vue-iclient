import type { InjectionKey } from 'vue'

export * from './card-props'
export * from './control-props'
export * from './layer-props'
export * from './imagery-layer'

/**
 * 使用真实发布包名作为全局协议命名空间，保证宿主与组件库存在不同构建副本时仍能共享注入。
 */
export const popupContentRuntimeRegistryKey = Symbol.for(
  '@supermapgis/vue3-iclient-mapboxgl/popup-content-runtime-registry'
) as InjectionKey<any>
