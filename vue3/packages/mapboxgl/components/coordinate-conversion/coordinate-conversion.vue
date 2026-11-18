<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :header-name="headerName"
    :background="background"
    :textColor="textColor"
    class="sm-component-coordinate-conversion"
  >
    <sm-card :bordered="false" :style="textColorStyle" class="sm-component-coordinate-conversion__sm-card">
      <div :class="['sm-component-coordinate-conversion__content', !showLocation && 'not-show-location']">
        <div class="sm-component-coordinate-conversion__auto-width">
          <sm-select
            v-model:value="activeFormat"
            :placeholder="t('measure.selectPlaceholder')"
            class="sm-component-coordinate-conversion__a-select"
            :get-popup-container="getPopupContainer"
            :dropdownMatchSelectWidth="true"
            size="small"
            @change="changeFormat"
          >
            <sm-select-option
              v-for="(value, index) in formatOptions"
              :key="index"
              :title="value.i18n || value.title"
              :value="value.title"
            >
              {{ value.i18n || value.title }}
            </sm-select-option>
          </sm-select>
          <sm-input
            v-model:value="inputValue"
            class="sm-component-coordinate-conversion__a-input"
            :placeholder="activeDisplayFormat || t('coordinateConversion.inputPlaceHolder')"
            size="small"
            allowClear
            @input="handleInput"
            @blur="handleBlur"
            @change="handleChange"
          ></sm-input>
        </div>
        <div class="sm-component-coordinate-conversion__icons">
          <div
            :class="[
              isCapture && `sm-component-coordinate-conversion__copyed${copyTargetId}`,
              isCapture
                ? 'sm-component-coordinate-conversion__copyed'
                : 'sm-component-coordinate-conversion__not-enable',
              'sm-components-icon-copy'
            ]"
            :data-clipboard-text="isCapture ? inputValue : ''"
            :title="t('coordinateConversion.copy')"
          ></div>
          <div
            v-if="showLocation"
            :title="t('coordinateConversion.location')"
            :class="['sm-component-coordinate-conversion__location', 'sm-components-icon-locate']"
            @click="handleLocation"
          ></div>
          <div
            :class="[
              isCapture
                ? 'sm-component-coordinate-conversion__captured'
                : 'sm-component-coordinate-conversion__not-captured',
              'sm-components-icon-click'
            ]"
            :title="isCapture ? t('coordinateConversion.capture') : t('coordinateConversion.realTime')"
            @click="handleCapture"
          ></div>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { CoordinateConversionProps, CoordinateConversionEvents, Coordinate, FormatOption } from './types'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTheme, useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmInput from '@supermapgis/common/components/input/Input'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import CoordinateConversionViewModel from '@supermapgis/iclient-components-core/mapboxgl/src/CoordinateConversionViewModel'
import { getProjection } from '@supermapgis/iclient-components-core/core/utils/epsg-define'
import { uniqueId } from 'lodash-es'
import ClipboardJS from 'clipboard'
import proj4 from 'proj4'
import { fromLatLon, toLatLon } from 'utm'
import { dd2dms, dd2ddm, format, parse, dms2dd, ddm2dd } from 'latlng-conv'
import { message as Message } from 'ant-design-vue'
import { coordinateConversionPropsDefault } from './types'

const COMPONENT_NAME = 'SmCoordinateConversion'

defineOptions({
  name: COMPONENT_NAME
})

const props = withDefaults(defineProps<CoordinateConversionProps>(), coordinateConversionPropsDefault)
defineEmits<CoordinateConversionEvents>()

const { t } = useLocale()
const { textColorStyle } = useTheme(props)
const viewModel = new CoordinateConversionViewModel()
const { getMap } = useMapGetter<Map>({ removed, viewModel })
const { isShow } = useMapControl()

// 复制按钮绑定的唯一 class 名，用于 ClipboardJS 事件委托
const copyTargetId = uniqueId('smcoordinateconversion-')
const decimals = 7

const activeFormat = ref('XY')
const activeDisplayFormat = ref('X°‎, Y°‎')
const inputValue = ref('')
const coordinate = ref<Coordinate | null>(null)
const clickCaptureTimes = ref(0)
const enableLocation = ref(true)
let clipboard: ClipboardJS | null = null

const isCapture = computed(() => clickCaptureTimes.value % 2 !== 0)

const formatOptions = ref<FormatOption[]>([])

// 默认格式（与 Vue2 保持一致，注意 ° 后的 U+200E 不可见字符会被解析时剔除）
const defaultFormats: FormatOption[] = [
  {
    title: 'BASEMAP',
    i18n: t('unit.BASEMAP'),
    display: 'X Y',
    fromWGS84: getBaseMapCoordinate,
    toWGS84: value => {
      const coor: Array<string | number> = value.split(' ')
      const coordinate: Coordinate = { lng: (coor[0] as number) * 1, lat: (coor[1] as number) * 1 }
      return getEpsgCoordinate(coordinate, 'EPSG:4326', getEpsgCode())
    }
  },
  {
    title: 'UTM',
    i18n: t('unit.UTM'),
    fromWGS84: getUtm,
    toWGS84: getCoorByUtm
  },
  {
    title: 'Mercator',
    i18n: t('unit.Mercator'),
    display: 'X Y',
    fromWGS84: getMercatorCoordinate,
    toWGS84: value => {
      const coor: Array<string | number> = value.split(' ')
      const coordinate: Coordinate = { lng: (coor[0] as number) * 1, lat: (coor[1] as number) * 1 }
      return getEpsgCoordinate(coordinate, 'EPSG:4326', 'EPSG:3857')
    }
  },
  {
    title: 'XY',
    i18n: t('unit.XY'),
    display: 'X°‎, Y°‎',
    fromWGS84: getXY,
    toWGS84: getCoorByXY
  },
  {
    title: 'DD',
    i18n: t('unit.DD'),
    display: 'Y° ‎N, X° ‎E‎',
    fromWGS84: getDD,
    toWGS84: getCoorByDD
  },
  {
    title: 'DOM',
    i18n: t('unit.DOM'),
    display: `Y°‎ A' N, X°‎ B' E`,
    fromWGS84: getDOM,
    toWGS84: getCoorByDOM
  },
  {
    title: 'DMS',
    i18n: t('unit.DMS'),
    display: `Y°‎ A' B" N, X°‎ C' D" E`,
    fromWGS84: getDMS,
    toWGS84: getCoorByDMS
  }
]

watch(
  () => props.formats,
  () => {
    const opts: FormatOption[] = []
    props.formats &&
      props.formats.forEach(item => {
        if (typeof item === 'string') {
          const defaultFormat = defaultFormats.find(val => val.title === item)
          defaultFormat && opts.push(defaultFormat)
        } else if (typeof item === 'object') {
          opts.push(item)
        }
      })
    if (opts[0] && !props.formats.includes('XY')) {
      activeFormat.value = opts[0].title
      activeDisplayFormat.value = opts[0].display || ''
    }
    formatOptions.value = opts
  },
  { immediate: true }
)

watch(isCapture, val => {
  if (val) {
    viewModel._bindCapture()
  } else {
    viewModel._bindHover()
  }
})

onMounted(() => {
  clipboard = new ClipboardJS(`.sm-component-coordinate-conversion__copyed${copyTargetId}`)
  clipboard.on('success', () => {
    Message.success(t('success.copySucccess'))
  })

  viewModel.on('getcoordinate', (res: { coordinate: Coordinate }) => {
    const { coordinate: coor } = res
    const formatOption = formatOptions.value.find(item => item.title === activeFormat.value)
    coordinate.value = coor
    inputValue.value = formatCoordinate(coor, formatOption) || ''
  })
})

onBeforeUnmount(() => {
  clipboard && clipboard.destroy()
})

function removed() {
  coordinate.value = null
  inputValue.value = ''
  clickCaptureTimes.value = 0
}

function getPopupContainer(triggerNode: HTMLElement) {
  return triggerNode?.closest('.sm-component-coordinate-conversion__content') as HTMLElement
}

function handleCapture() {
  clickCaptureTimes.value++
}

function handleInput(e: any) {
  if (!isCapture.value) {
    handleCapture()
  }
  inputValue.value = e.target.value
  enableLocation.value = true
}

function handleBlur(e: any) {
  const formatOption = formatOptions.value.find(item => item.title === activeFormat.value)
  coordinate.value = reverseCoordinateFormat(e.target.value, formatOption)
}

function handleChange(e: any) {
  if (!e.target.value) {
    enableLocation.value = false
    coordinate.value = null
  }
}

function handleLocation() {
  if (!coordinate.value) {
    return
  }
  enableLocation.value = false
  if (!isCapture.value) {
    handleCapture()
  }
  const { lng, lat } = coordinate.value
  viewModel._addMarker([lng, lat])
  viewModel._flyTo([lng, lat])
}

function changeFormat(val: string) {
  const formatOption = formatOptions.value.find(item => item.title === val)
  activeDisplayFormat.value = (formatOption && formatOption.display) || ''
  inputValue.value = formatCoordinate(coordinate.value, formatOption) || ''
}

function formatCoordinate(coordinate: Coordinate | null, formatOption?: FormatOption, format?: string) {
  if (!coordinate || !formatOption) {
    viewModel._clearMarker()
    return null
  }
  const fromWGS84 = formatOption.fromWGS84 || getXY
  return fromWGS84(coordinate, format || formatOption.display)
}

function reverseCoordinateFormat(value: string = inputValue.value, formatOption?: FormatOption, format?: string) {
  value = value.replace(/^(?:\s+|\s+)$ /, '')
  if (!value || !formatOption) {
    viewModel._clearMarker()
    return null
  }
  const toWGS84 = formatOption.toWGS84 || getCoorByXY
  return toWGS84(value, format)
}

function getUtm(coordinate: Coordinate) {
  const { easting, northing, zoneNum, zoneLetter } = fromLatLon(coordinate.lat, getWrapNum(coordinate.lng))
  return `${zoneNum}${zoneLetter} ${Math.trunc(easting)} ${Math.trunc(northing)}`
}

function getMercatorCoordinate(coordinate: Coordinate) {
  const { lng, lat } = getEpsgCoordinate(coordinate, 'EPSG:3857')
  return `${lng.toFixed(3)} ${lat.toFixed(3)}`
}

function getBaseMapCoordinate(coordinate: Coordinate) {
  const { lng, lat } = getEpsgCoordinate(coordinate)
  return `${lng.toFixed(3)} ${lat.toFixed(3)}`
}

function getEpsgCoordinate(coordinate: Coordinate, toEpsgCode?: string, sourceEpsgCode = 'EPSG:4326') {
  const { lng, lat } = coordinate
  toEpsgCode = toEpsgCode || getEpsgCode()
  const toProjection = getProjection(toEpsgCode) as any
  const sourceProjection = getProjection(sourceEpsgCode) as any
  const coor = sourceEpsgCode === toEpsgCode ? [lng, lat] : proj4(sourceProjection, toProjection, [lng, lat])
  return { lng: coor[0], lat: coor[1] }
}

function getEpsgCode(map: Map = getMap()): string {
  if (!map) {
    return ''
  }
  const crs = (map as any).getCRS?.()
  return crs?.epsgCode || ''
}

function getWrapNum(x: number, includeMax = true, includeMin = true, range: Array<number> = [-180, 180]) {
  const max = range[1]
  const min = range[0]
  const d = max - min
  if (x === max && includeMax) {
    return x
  }
  if (x === min && includeMin) {
    return x
  }
  const tmp = (((x - min) % d) + d) % d
  if (tmp === 0 && includeMax) {
    return max
  }
  return (((x - min) % d) + d) % d + min
}

function getWE(lng?: number) {
  if (lng === 0) {
    return ''
  }
  return lng > 0 ? 'E' : 'W'
}

function getNS(lat?: number) {
  if (lat === 0) {
    return ''
  }
  return lat > 0 ? 'N' : 'S'
}

function getXY(coordinate: Coordinate, format?: string) {
  const { lng, lat } = coordinate
  const newLat: any = lat.toFixed(decimals)
  const wrapLng = Number(getWrapNum(lng).toFixed(decimals))
  let XY = format.replace('X', wrapLng + '')
  XY = XY.replace('Y', newLat * 1 + '')
  return XY
}

function getDD(coordinate: Coordinate, format?: string) {
  const { lng, lat } = coordinate
  const newLat: any = lat.toFixed(decimals)
  const wrapLng = Number(getWrapNum(lng).toFixed(decimals))
  let XY = format.replace('X', wrapLng + '')
  XY = XY.replace('Y', newLat * 1 + '')
  XY = XY.replace('E', getWE(wrapLng))
  XY = XY.replace('N', getNS(newLat * 1))
  return XY
}

function getDOM(coordinate: Coordinate) {
  const { lng } = coordinate
  const wrapLng = getWrapNum(lng)
  const formatDM = dm => {
    const { degrees, minutes, direction } = dm
    return `${degrees}° ${minutes}' ${direction}`
  }
  return `${formatDM(dd2ddm(coordinate.lat, 'lat'))} ${formatDM(dd2ddm(wrapLng, 'lng'))}`
}

function getDMS(coordinate: Coordinate) {
  const { lng } = coordinate
  const wrapLng = getWrapNum(lng)
  return `${format(dd2dms(coordinate.lat, 'lat'))} ${format(dd2dms(wrapLng, 'lng'))}`
}

function getCoorByXY(value?: string) {
  value = replaceUnit(value)
  value = value.replace(/‎|°|\s+/g, '')
  const coordinates = value.split(',')
  return { lng: (coordinates[0] as any) * 1, lat: (coordinates[1] as any) * 1 }
}

function getCoorByDD(value?: string) {
  value = replaceUnit(value)
  value = value.replace(/‎|°|\s+/g, '')
  value = value.replace(/E|N|W|S/gi, '')
  const coordinates = value.split(',')
  return { lng: (coordinates[1] as any) * 1, lat: (coordinates[0] as any) * 1 }
}

function getCoorByDOM(value?: string) {
  const { latStr, lngStr } = getDMLatLng(value)
  if (!latStr || !lngStr) {
    return { lng: NaN, lat: NaN }
  }
  const ddmLng = parseDM(lngStr)
  const ddmLat = parseDM(latStr)
  const lng = ddm2dd(ddmLng)
  const lat = ddm2dd(ddmLat)
  return { lng, lat }
}

function getCoorByDMS(value?: string) {
  const { latStr, lngStr } = getDMLatLng(value)
  if (!latStr || !lngStr) {
    return { lng: NaN, lat: NaN }
  }
  const ddmLng = parse(lngStr)
  const ddmLat = parse(latStr)
  const lng = dms2dd(ddmLng)
  const lat = dms2dd(ddmLat)
  return { lng, lat }
}

function getCoorByUtm(value?: string) {
  const [zone, easting, northing] = value.split(' ')
  const zoneNum: number = parseInt(zone)
  const zoneLetter = Object.is(zoneNum, NaN) ? zone : zone.replace(zoneNum + '', '')
  const { latitude, longitude } = toLatLon(easting, northing, zoneNum, zoneLetter)
  return { lng: longitude, lat: latitude }
}

function replaceUnit(value?: string) {
  value = value.replace(/º/g, '°')
  value = value.replace(/\'\'/g, '"')
  return value
}

function getDMLatLng(value: string) {
  const unit = ['N', 'S']
  let index = value.indexOf(unit[0])
  if (index < 0) {
    index = value.indexOf(unit[1])
  }
  if (index < -1) {
    return { latStr: '', lngStr: '' }
  }
  const latStr = value.slice(0, index + 1).trim()
  const lngStr = value.slice(index + 1).trim()
  return { latStr, lngStr }
}

function parseDM(value: string) {
  const pattern = /^([0-1]?[0-9]?[0-9])°\s([0-5]?[0-9](?:.\d+)?)'\s?(N|S|E|W)?$/
  const results = pattern.exec(value)
  if (!results) {
    throw new Error(t('coordinateConversion.errorCoordinate'))
  }
  const [degrees, minutes, direction] = results.slice(1, 4)
  const dm = {
    degrees: parseInt(degrees, 10),
    minutes: parseFloat(minutes)
  }
  return direction ? Object.assign(dm, { direction }) : dm
}
</script>
