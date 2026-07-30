import type { Ref } from 'vue'
import { markRaw } from 'vue'
import { Divider } from 'ant-design-vue'
import FieldInfo from './field-info.vue'
import TextInfo from './text-info.vue'
import MediaInfo from './media-info.vue'
import PopupUtil from './util/PopupUtil'
import type { PopupContentRenderer } from './runtime-registry'

const resolveTextInfos = (infos: any[], feature: Record<string, any>) => infos.map(info => ({
  ...info,
  insert: PopupUtil.getResult(info.insert, feature),
  ...(info.attributes?.link
    ? {
        attributes: {
          ...info.attributes,
          link: PopupUtil.getResult(info.attributes.link, feature)
        }
      }
    : {})
}))

export function createBuiltInPopupContentRenderers(
  attributeStyle: Ref<Record<string, any>>
): PopupContentRenderer[] {
  return [
    {
      type: 'FIELD',
      component: markRaw(FieldInfo),
      parse: (elements, index, context) => {
        const element = elements[index]
        const fieldName = PopupUtil.getResult(element.fieldName, context.attributes)
        return {
          element: {
            type: 'FIELD',
            infos: [{
              ...element,
              fieldName,
              fieldCaption: element.fieldCaption || context.popupInfo.fieldCaptions?.[fieldName],
              value: PopupUtil.getResult(['get', fieldName], context.attributes)
            }]
          },
          nextIndex: index + 1
        }
      },
      resolveProps: context => ({
        infos: context.element,
        attributeStyle: attributeStyle.value
      })
    },
    {
      type: 'TEXT',
      component: markRaw(TextInfo),
      parse: (elements, index, context) => ({
        element: {
          type: 'TEXT',
          infos: resolveTextInfos(elements[index].infos || [], context.attributes)
        },
        nextIndex: index + 1
      }),
      resolveProps: context => ({ infos: context.element })
    },
    {
      type: 'MEDIA',
      component: markRaw(MediaInfo),
      matches: element => ['IMAGE', 'VIDEO'].includes(element.type),
      parse: (elements, index, context) => {
        const infos = []
        let nextIndex = index
        while (nextIndex < elements.length && ['IMAGE', 'VIDEO'].includes(elements[nextIndex].type)) {
          const element = elements[nextIndex]
          infos.push({
            ...element,
            title: PopupUtil.getResult(element.title, context.attributes),
            value: PopupUtil.getResult(element.value, context.attributes)
          })
          nextIndex += 1
        }
        return { element: { type: 'MEDIA', infos }, nextIndex }
      },
      resolveProps: context => ({ infos: context.element })
    },
    {
      type: 'DIVIDER',
      component: markRaw(Divider),
      resolveProps: () => ({ dashed: true })
    }
  ]
}