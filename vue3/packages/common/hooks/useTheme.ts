import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import type { ThemeStyleParams } from 'vue-iclient-core/utils/style/color/serialColors';
import { ref, computed, reactive, watch, toRefs, onBeforeMount, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import globalEvent from 'vue-iclient-core/utils/global-event';
import { getDerivedColorsByTextColor } from 'vue-iclient-core/utils/util';
import { getPrimarySerialColors, getRootStyleSelector } from 'vue-iclient-core/utils/style/color/serialColors';
import { themeProps } from '@supermapgis/common/utils/index.common'

interface ThemeData {
  backgroundData: string
  textColorsData: string
  collapseCardBackgroundData: string
  collapseCardHeaderBgData: string
  subComponentSpanBgData: string
  tablePopupBgData: string
  colorGroupsData: string[]
}

export function useTheme(themeStyleName: string[] = []) {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as ThemeProps

  const themeData = reactive<ThemeData>({
    backgroundData: '',
    textColorsData: '',
    collapseCardBackgroundData: '',
    collapseCardHeaderBgData: '',
    subComponentSpanBgData: '',
    tablePopupBgData: '',
    colorGroupsData: []
  })
  // 对接 TimeLine 和 TimeRange 会用到
  const themeStyleMap = ref<Record<string, string>>({})

  const getBackgroundStyle = computed(() => ({
    background: themeData.backgroundData
  }))

  const collapseCardBackgroundStyle = computed(() => ({
    background: themeData.collapseCardBackgroundData
  }))

  const collapseCardBackgroundLightStyle = computed(() => ({
    background: getPrimarySerialColors({ colorGroup: [themeData.collapseCardBackgroundData] })[2]
  }))

  const collapseCardHeaderBgStyle = computed(() => ({
    background: themeData.collapseCardHeaderBgData
  }))

  const subComponentSpanBgStyle = computed(() => ({
    background: themeData.subComponentSpanBgData
  }))

  const tablePopupBgStyle = computed(() => ({
    background: themeData.tablePopupBgData
  }))

  const getTextColorStyle = computed(() => ({
    color: themeData.textColorsData
  }))

  const headingTextColorStyle = computed(() => ({
    color: getDerivedColorsByTextColor(themeData.textColorsData, 0.85)
  }))

  const secondaryTextColorStyle = computed(() => ({
    color: getDerivedColorsByTextColor(themeData.textColorsData, 0.45)
  }))

  const disabledTextColorStyle = computed(() => ({
    color: getDerivedColorsByTextColor(themeData.textColorsData, 0.25)
  }))

  const getBackground = computed(() => themeData.backgroundData)

  const getTextColor = computed(() => themeData.textColorsData)

  const getColorStyle = computed(() => {
    return (index: number) => ({
      color: themeData.colorGroupsData[index]
    })
  })

  const getColor = computed(() => {
    return (index: number) => themeData.colorGroupsData[index]
  })

  const changeThemeCallback = ({ themeStyle }: { themeStyle: ThemeStyleParams }) => {
    setDataRelatedProps(themeStyle, true)
    if ('background' in themeStyle) {
      setDataRelatedWithBackgound('', themeStyle)
    }
    initNeedTheme(themeStyle)
  }

  const initThemeData = () => {
    setDataRelatedProps()
    setDataRelatedWithBackgound(props.background)
  }

  const initNeedTheme = (themeStyle: ThemeStyleParams) => {
    themeStyleMap.value = themeStyleName.reduce((list, name) => {
      if (name === 'primaryColor') {
        list[name] = themeStyle.colorGroup?.[0]
      } else {
        list[name] = getRealColor(name, themeStyle)
      }
      return list;
    }, {} as Record<string, string>);
  }

  const registerPropListener = () => {
    const propNames = getSelfProps()
    propNames.forEach((prop: string) => {
      watch(() => props[prop], (next: string) => {
        const dataName: string = getDataNameOfProp(prop)
        themeData[dataName] = next || getRealColor(prop)
        if (prop === 'background') {
          setDataRelatedWithBackgound(next)
        }
      })
    })
  }

  const setDataRelatedProps = (themeStyle?: ThemeStyleParams, themePriority?: boolean) => {
    const themeStyleData = themeStyle || globalEvent.theme || {}
    const propNames = getSelfProps()
    propNames.forEach((prop: string) => {
      if (prop in themeStyleData) {
        const dataName: string = getDataNameOfProp(prop)
        const propValue = themePriority ? '' : props[prop]
        themeData[dataName] = propValue || getRealColor(prop, themeStyle)
      }
    })
  }

  const setDataRelatedWithBackgound = (background?: string, themeStyle?: ThemeStyleParams) => {
    themeData.collapseCardHeaderBgData = background || getRealColor('collapseCardHeaderBg', themeStyle)
    themeData.subComponentSpanBgData = background || getRealColor('subComponentSpanBg', themeStyle)
    themeData.collapseCardBackgroundData =
      background || getRealColor('collapseCardBackground', themeStyle)
    themeData.tablePopupBgData = background || getRealColor('messageBackground', themeStyle)
  }

  const getSelfProps = () => {
    return Object.keys(themeProps())
  }

  const getRealColor = (prop: string, acceptThemeStyle?: ThemeStyleParams) => {
    const themeStyle = (acceptThemeStyle || globalEvent.theme) as unknown as ThemeStyleParams
    if (prop === 'colorGroup' || !themeStyle?.[prop]?.includes('var')) {
      return themeStyle?.[prop]
    }
    const rootStyleSelector = getRootStyleSelector(themeStyle)
    const computedStyle = window.getComputedStyle(document.querySelector(rootStyleSelector))
    const themeColor = themeStyle[prop].replace(/var\((.+)\)/g, '$1')
    const colorValue = computedStyle.getPropertyValue(themeColor)
    return colorValue.trim()
  }

  const getDataNameOfProp = (prop: string) => {
    switch (prop) {
      case 'textColor':
        return 'textColorsData'
      case 'colorGroup':
        return 'colorGroupsData'
      default:
        return `${prop}Data`
    }
  }

  onBeforeMount(() => {
    initThemeData()
    registerPropListener()
  })

  onMounted(() => {
    globalEvent.on({
      'change-theme': changeThemeCallback
    })
  })

  onBeforeUnmount(() => {
    globalEvent.un({
      'change-theme': changeThemeCallback
    })
  })

  return {
    ...toRefs(themeData),
    themeStyleMap,
    getBackgroundStyle,
    collapseCardBackgroundStyle,
    collapseCardBackgroundLightStyle,
    collapseCardHeaderBgStyle,
    subComponentSpanBgStyle,
    tablePopupBgStyle,
    getTextColorStyle,
    headingTextColorStyle,
    secondaryTextColorStyle,
    disabledTextColorStyle,
    getBackground,
    getTextColor,
    getColorStyle,
    getColor
  }
}
