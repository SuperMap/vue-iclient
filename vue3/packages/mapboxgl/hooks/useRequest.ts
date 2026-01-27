import { set, uniqBy } from 'lodash-es'
import getFeatures from 'vue-iclient-core/utils/get-features'
import { watch, ref } from 'vue'

export interface TreeData {
  title?: string
  key: string | number
  children?: TreeData[]
}
export interface CascaderData {
  label: string
  value: string | number
  children?: CascaderData[]
}
export interface DataConfig {
  // 数据服务地址
  dataset: object
  // 标识字段
  idField: string
  // 显示名称字段
  titleField: string
  children?: DataConfig
  parentField?: string
}

export interface DataItem {
  value: string
  label: string
  parentValue: string
  geometry?: GeoJSON.Geometry
  dataset: object
  idField: string
  originalIdField: string
  children?: DataItem[]
}
const ROOT_VALUE = 'root'

export function useRequest<T extends 'tree' | 'cascader'>({
  props,
  type
}: {
  props: { config: DataConfig }
  type: T
}) {
  const options = ref<T extends 'tree' ? TreeData[] : CascaderData[]>([])
  let datas = ref<DataItem[]>([])

  watch(
    () => props.config,
    config => {
      createOptions(config, false)
    },
    { immediate: true, deep: true }
  )

  async function createOptions(config: DataConfig, hasGeometry: boolean) {
    if(!config || !Object.keys(config).length) {
      datas.value = []
      options.value = []
      return;
    }
    datas.value = await requestData(config, hasGeometry)
    options.value = assembleOptions(datas.value)
  }

  async function requestData(config: DataConfig, hasGeometry: boolean) {
    const { dataset, idField, titleField, parentField, children } = config
    const data = await getFeatures({ ...dataset, hasGeometry })
    const features = data.features
    const fields = data.fields
    const originalFields = data.originalFields ?? []
    const keyIndex = fields.indexOf(idField)
    const originalIdField = originalFields[keyIndex] ?? idField
    const nameIndex = fields.indexOf(titleField)
    const parentValueIdx = parentField ? fields.indexOf(parentField) : -1

    const values = data.fieldValues
    let result: DataItem[] = features.map((f, featureIndex) => {
      return {
        value: values[keyIndex][featureIndex],
        label: values[nameIndex][featureIndex],
        parentValue: parentField ? values[parentValueIdx][featureIndex] : ROOT_VALUE,
        dataset,
        idField,
        originalIdField
      }
    })
    if (children) {
      const childOptions = await requestData(children, hasGeometry)
      result = result.concat(childOptions)
    }
    return uniqBy(result, 'value')
  }

  function assembleOptions(array: DataItem[]) {
    const allData = [].concat(...array)
    // 创建parentId到子项数组的映射
    const nodesMap = new Map()

    // 初始化映射表
    allData.forEach(item => {
      const parentId = item.parentValue ?? ROOT_VALUE
      if (!nodesMap.has(parentId)) {
        nodesMap.set(parentId, [])
      }
      nodesMap.get(parentId).push(item)
    })

    // 将子的往父的children属性添加
    nodesMap.forEach(children => {
      findChildNodes(nodesMap, children)
    })

    // 格式化成组件需要的格式
    const result = formatOptions(allData, nodesMap)
    return result[0].children
  }

  // 递归构建树
  function findChildNodes(nodesMap: Map<string, DataItem[]>, children: DataItem[]) {
    for (const child of children) {
      const value = child.value
      const childrenMap = nodesMap.get(value)
      if (!childrenMap) continue

      child.children = childrenMap
      nodesMap.delete(value)
      findChildNodes(nodesMap, childrenMap)
    }
  }

  function formatOptions(allData: DataItem[], nodesMap: Map<string, DataItem[]>) {
    const result = []
    nodesMap.forEach((children, parentId) => {
      const target = allData.find(v => v.parentValue === parentId)
      if (!target) {
        return
      }
      result.push(
        type === 'tree'
          ? {
              key: target.parentValue,
              title: target.parentValue,
              children: formatChildren(children)
            }
          : {
              value: target.parentValue,
              label: target.parentValue,
              children: formatChildren(children)
            }
      )
    })
    return result
  }

  function formatChildren(childs: DataItem[]) {
    return childs.map(v => {
      const option =
        type === 'tree'
          ? {
              title: v.label,
              key: v.value
            }
          : {
              value: v.value,
              label: v.label
            }
      if (v.children) {
        const newChilds = formatChildren(v.children)
        set(option, 'children', newChilds)
      }
      return option
    })
  }

  async function requestDataByFilter(value) {
    if (!value?.length || !options.value.length) return;
    const lastValue = value[value.length - 1];
    const target = datas.value.find(v => v.value === lastValue);
    const attributeFilter = `("${target.originalIdField}" like '%${lastValue}%')`;
    const data = await getFeatures({ ...target.dataset, attributeFilter });
    return data?.features?.[0];
  }

  return {
    options,
    datas,
    requestDataByFilter
  }
}
