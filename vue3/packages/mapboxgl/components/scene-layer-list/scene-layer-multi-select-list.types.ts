export type SceneLayerMultiSelectValue = string | number

export interface SceneLayerMultiSelectItem {
  id: string
  name: string
  selectedValues: SceneLayerMultiSelectValue[]
}

export interface SceneLayerMultiSelectOption {
  label: string
  value: SceneLayerMultiSelectValue
}
