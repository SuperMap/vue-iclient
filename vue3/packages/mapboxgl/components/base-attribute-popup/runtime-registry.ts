import type { Component, ShallowRef } from 'vue'
import type { PopupInfo } from './types'

export type PopupContentHost = 'map' | 'scene'

export interface PopupContentRuntimeContext {
  element: Record<string, any>
  attributes: Record<string, any>
  features: Record<string, any>[]
  index: number
  popupInfo: PopupInfo
  event?: Record<string, any>
  host: PopupContentHost
  target?: string
}

export interface PopupContentParserContext {
  attributes: Record<string, any>
  popupInfo: PopupInfo
}

export interface PopupContentParseResult {
  element: Record<string, any>
  nextIndex: number
}

export interface PopupContentRenderer {
  type: string
  component: Component
  hosts?: readonly PopupContentHost[]
  matches?: (element: Record<string, any>) => boolean
  parse?: (
    elements: Record<string, any>[],
    index: number,
    context: PopupContentParserContext
  ) => PopupContentParseResult
  resolveProps?: (context: PopupContentRuntimeContext) => Record<string, any>
}

export function resolvePopupContent(
  elements: Record<string, any>[],
  renderers: PopupContentRenderer[],
  context: PopupContentParserContext
) {
  const result: Record<string, any>[] = []
  let index = 0
  while (index < elements.length) {
    const sourceElement = elements[index]
    const renderer = renderers.find(item =>
      item.matches?.(sourceElement) || item.type === sourceElement.type
    )
    if (!renderer) {
      index += 1
      continue
    }
    const parsed = renderer.parse?.(elements, index, context) || {
      element: { type: renderer.type, infos: sourceElement },
      nextIndex: index + 1
    }
    result.push(parsed.element)
    index = parsed.nextIndex
  }
  return result
}

export interface PopupContentRuntimeRegistry {
  renderers: ShallowRef<PopupContentRenderer[]>
}

export { popupContentRuntimeRegistryKey } from '@supermapgis/mapboxgl/utils'