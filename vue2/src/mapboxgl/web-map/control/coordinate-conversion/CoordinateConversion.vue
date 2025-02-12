<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :headerName="headerName"
    :background="background"
    :textColor="textColor"
    class="sm-component-coordinate-conversion"
  >
    <sm-card :bordered="false" :style="getTextColorStyle" class="sm-component-coordinate-conversion__sm-card">
      <div :class="['sm-component-coordinate-conversion__content', !showLocation && 'not-show-location']">
        <div class="sm-component-coordinate-conversion__auto-width">
          <sm-select
            v-model="activeFormat"
            :placeholder="$t('measure.selectPlaceholder')"
            class="sm-component-coordinate-conversion__a-select"
            :get-popup-container="getPopupContainer"
            :dropdownMatchSelectWidth="true"
            size="small"
            @change="changeFormat"
          >
            <sm-select-option
              v-for="(value, key, index) in formatOptions"
              :key="index"
              :title="value.i18n || value.title"
              :value="value.title"
              >{{ value.i18n || value.title }}</sm-select-option
            >
          </sm-select>
          <sm-input
            v-model="inputValue"
            :class="['sm-component-coordinate-conversion__a-input']"
            :placeholder="activeDisplayFormat || $t('coordinateConversion.inputPlaceHolder')"
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
              isCapture && `sm-component-coordinate-conversion__copyed${uniqueId}`,
              isCapture
                ? 'sm-component-coordinate-conversion__copyed'
                : 'sm-component-coordinate-conversion__not-enable',
              'sm-components-icon-copy'
            ]"
            :data-clipboard-text="isCapture ? inputValue : ''"
            :title="$t('coordinateConversion.copy')"
          ></div>
          <div
            v-if="showLocation"
            :title="$t('coordinateConversion.location')"
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
            :title="isCapture ? $t('coordinateConversion.capture') : $t('coordinateConversion.realTime')"
            @click="handleCapture"
          ></div>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>
<script lang="ts">
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import SmInput from 'vue-iclient/src/common/input/Input.vue';
import SmSelect from 'vue-iclient/src/common/select/Select.vue';
import SmSelectOption from 'vue-iclient/src/common/select/Option.vue';
import SmCard from 'vue-iclient/src/common/card/Card.vue';
import SmCollapse from 'vue-iclient/src/common/collapse/Collapse.vue';
import CoordinateConversionViewModel from './CoordinateConversionViewModel';
import { getProjection } from 'vue-iclient-core/utils/epsg-define';
import ClipboardJS from 'clipboard';
import proj4 from 'proj4';
import UniqueId from 'lodash.uniqueid';
import { dd2dms, dd2ddm, format, parse, dms2dd, ddm2dd } from 'latlng-conv';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import Message from 'vue-iclient/src/common/message/Message.js';

const utm = require('utm');

type Coordinate = {
  lng: number;
  lat: number;
};
interface FormatOption {
  title: string;
  i18n?: string;
  display?: string;
  toWGS84(val: string, format?: string): Coordinate;
  fromWGS84(coordinate: Coordinate, format?: string): string;
}

@Component({
  name: 'SmCoordinateConversion',
  components: {
    SmInput,
    SmSelect,
    SmSelectOption,
    SmCard,
    SmCollapse
  }
})
class SmCoordinateConversion extends Mixins(MapGetter, Control, Theme, BaseCard) {
  // eslint-disable-next-line
  map: mapboxglTypes.Map;
  viewModel: any;
  $t: any;
  clickCaptureTimes: number = 0;
  defaultFormats: Array<FormatOption> = [];
  formatOptions: Array<FormatOption> = [];
  activeFormat: string = 'XY';
  activeDisplayFormat: string = 'X°‎, Y°‎';
  inputValue: string = '';
  iconValue: string = '';
  coordinate: Coordinate | null = null;
  clipboard: any;
  enableLocation: boolean = true;
  uniqueId: string = UniqueId(`${this.$options.name.toLowerCase()}-`);
  decimals: number = 7;

  @Prop({ default: 'sm-components-icon-coordinate-coversion' }) iconClass: string;
  @Prop({ default: false }) collapsed: boolean;
  @Prop({ default: true }) showLocation: boolean;
  @Prop({
    default() {
      return ['BASEMAP', 'Mercator', 'XY', 'UTM', 'DD', 'DOM', 'DMS'];
    }
  })
  formats: Array<string | FormatOption>;

  get isCapture() {
    return this.clickCaptureTimes % 2 !== 0;
  }

  @Watch('isCapture')
  isCaptureWatcher() {
    if (this.isCapture) {
      this.viewModel._bindCapture();
    } else {
      this.viewModel._bindHover();
    }
  }

  @Watch('formats', { immediate: true })
  formatsWatcher() {
    let formatOptions = [];
    this.formats &&
      this.formats.forEach(item => {
        if (typeof item === 'string') {
          const defaultFormat = this.defaultFormats.find(val => val.title === item);
          defaultFormat && formatOptions.push(defaultFormat);
        } else if (typeof item === 'object') {
          formatOptions.push(item);
        }
      });
    if (formatOptions && formatOptions[0] && !this.formats.includes('XY')) {
      this.activeFormat = formatOptions[0].title;
      this.activeDisplayFormat = formatOptions[0].display || '';
    }
    this.formatOptions = formatOptions;
  }

  created() {
    this.defaultFormats = [
      {
        title: 'BASEMAP',
        i18n: this.$t('unit.BASEMAP'),
        display: `X Y`,
        fromWGS84: this.getBaseMapCoordinate,
        toWGS84: value => {
          const coor: Array<string | number> = value.split(' ');
          // @ts-ignore
          const coor1: Coordinate = { lng: coor[0] * 1, lat: coor[1] * 1 };
          return this.getEpsgCoordinate(coor1, 'EPSG:4326', this.getEpsgCode());
        }
      },
      {
        title: 'UTM',
        i18n: this.$t('unit.UTM'),
        fromWGS84: this.getUtm,
        toWGS84: this.getCoorByUtm
      },
      {
        title: 'Mercator',
        i18n: this.$t('unit.Mercator'),
        display: `X Y`,
        fromWGS84: this.getMercatorCoordinate,
        toWGS84: value => {
          const coor: Array<string | number> = value.split(' ');
          // @ts-ignore
          const coor2: Coordinate = { lng: coor[0] * 1, lat: coor[1] * 1 };
          return this.getEpsgCoordinate(coor2, 'EPSG:4326', 'EPSG:3857');
        }
      },
      {
        title: 'XY',
        i18n: this.$t('unit.XY'),
        display: 'X°‎, Y°‎',
        fromWGS84: this.getXY,
        toWGS84: this.getCoorByXY
      },
      {
        title: 'DD',
        i18n: this.$t('unit.DD'),
        display: 'Y° ‎N, X° ‎E‎',
        fromWGS84: this.getDD,
        toWGS84: this.getCoorByDD
      },
      {
        title: 'DOM',
        i18n: this.$t('unit.DOM'),
        display: `Y°‎ A' N, X°‎ B' E`,
        fromWGS84: this.getDOM,
        toWGS84: this.getCoorByDOM
      },
      {
        title: 'DMS',
        i18n: this.$t('unit.DMS'),
        display: `Y°‎ A' B" N, X°‎ C' D" E`,
        fromWGS84: this.getDMS,
        toWGS84: this.getCoorByDMS
      }
    ];
    this.formatOptions = [...this.defaultFormats];
    const clipboard = (this.clipboard = new ClipboardJS(`.sm-component-coordinate-conversion__copyed${this.uniqueId}`));
    clipboard.on('success', () => {
      // @ts-ignore
      Message.success(this.$t('success.copySucccess'));
    });
    this.viewModel = new CoordinateConversionViewModel();
    this.viewModel.on('getcoordinate', res => {
      const { coordinate } = res;
      const formatOption = this.formatOptions.find(item => item.title === this.activeFormat);
      this.coordinate = coordinate;
      this.inputValue = this.formatCoordinate(this.coordinate, formatOption);
    });
  }

  beforeDestroy() {
    this.clipboard && this.clipboard.destroy();
  }

  getPopupContainer() {
    return this.$el.querySelector('.sm-component-coordinate-conversion__content');
  }

  handleCapture() {
    this.clickCaptureTimes++;
  }

  handleInput(e) {
    if (!this.isCapture) {
      this.handleCapture();
    }
    this.inputValue = e.target.value;
    this.enableLocation = true;
  }

  handleBlur(e) {
    const formatOption = this.formatOptions.find(item => item.title === this.activeFormat);
    this.coordinate = this.reverseCoordinateFormat(e.target.value, formatOption);
  }

  handleChange(e) {
    if (!e.target.value) {
      this.enableLocation = false;
      this.coordinate = null;
    }
  }

  handleLocation() {
    if (!this.coordinate) {
      return;
    }
    this.enableLocation = false;
    if (!this.isCapture) {
      this.handleCapture();
    }
    const { lng, lat } = this.coordinate;
    this.viewModel._addMarker([lng, lat]);
    this.viewModel._flyTo([lng, lat]);
  }

  changeFormat(val) {
    const formatOption = this.formatOptions.find(item => item.title === val);
    this.activeDisplayFormat = formatOption && formatOption.display;
    this.inputValue = this.formatCoordinate(this.coordinate, formatOption);
  }

  formatCoordinate(coordinate: Coordinate | null, formatOption: FormatOption, format?: string) {
    if (!coordinate || !formatOption) {
      this.viewModel._clearMarker();
      return null;
    }
    const fromWGS84 = formatOption.fromWGS84 || this.getXY;
    return fromWGS84(coordinate, format || formatOption.display);
  }

  reverseCoordinateFormat(value: string = this.inputValue, formatOption: FormatOption, format?: string) {
    value = value.replace(/^(?:\s+|\s+)$ /, '');
    if (!value || !formatOption) {
      this.viewModel._clearMarker();
      return null;
    }
    const toWGS84 = formatOption.toWGS84 || this.getCoorByXY;
    return toWGS84(value, format);
  }

  getUtm(coordinate: Coordinate) {
    let { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(coordinate.lat, this.getWrapNum(coordinate.lng));
    return `${zoneNum}${zoneLetter} ${parseInt(easting)} ${parseInt(northing)}`;
  }

  getMercatorCoordinate(coordinate: Coordinate) {
    const { lng, lat } = this.getEpsgCoordinate(coordinate, 'EPSG:3857');
    return `${lng.toFixed(3)} ${lat.toFixed(3)}`;
  }

  getBaseMapCoordinate(coordinate: Coordinate) {
    const { lng, lat } = this.getEpsgCoordinate(coordinate);
    return `${lng.toFixed(3)} ${lat.toFixed(3)}`;
  }

  getEpsgCoordinate(coordinate: Coordinate, toEpsgCode?: string, sourceEpsgCode: string = 'EPSG:4326') {
    const { lng, lat } = coordinate;
    toEpsgCode = toEpsgCode || this.getEpsgCode();
    const toProjection = getProjection(toEpsgCode);
    const sourceProjection = getProjection(sourceEpsgCode);
    // @ts-ignore
    const coor = sourceEpsgCode === toEpsgCode ? [lng, lat] : proj4(sourceProjection, toProjection, [lng, lat]);
    return { lng: coor[0], lat: coor[1] };
  }
  // eslint-disable-next-line
  getEpsgCode(map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return '';
    }
    // @ts-ignore
    return this.map.getCRS().epsgCode;
  }

  getWrapNum(x: number, includeMax: boolean = true, includeMin: boolean = true, range: Array<number> = [-180, 180]) {
    let max = range[1];
    let min = range[0];
    let d = max - min;
    if (x === max && includeMax) {
      return x;
    }
    if (x === min && includeMin) {
      return x;
    }
    let tmp = (((x - min) % d) + d) % d;
    if (tmp === 0 && includeMax) {
      return max;
    }
    return ((((x - min) % d) + d) % d) + min;
  }

  getWE(lng?: number) {
    if (lng === 0) {
      return '';
    }
    return lng > 0 ? 'E' : 'W';
  }

  getNS(lat?: number) {
    if (lat === 0) {
      return '';
    }
    return lat > 0 ? 'N' : 'S';
  }

  getXY(coordinate: Coordinate, format?: string) {
    let { lng, lat } = coordinate;
    const newLat: any = lat.toFixed(this.decimals);
    lat = newLat * 1;
    // @ts-ignore
    lng = this.getWrapNum(lng).toFixed(this.decimals) * 1;
    let XY = format.replace('X', lng + '');
    XY = XY.replace('Y', lat + '');
    return XY;
  }

  getDD(coordinate: Coordinate, format?: string) {
    let { lng, lat } = coordinate;
    lng = this.getWrapNum(lng);
    const newLat: any = lat.toFixed(this.decimals);
    lat = newLat * 1;
    // @ts-ignore
    lng = this.getWrapNum(lng).toFixed(this.decimals) * 1;
    let XY = format.replace('X', lng + '');
    XY = XY.replace('Y', lat + '');
    XY = XY.replace('E', this.getWE(lng));
    XY = XY.replace('N', this.getNS(lat));
    return XY;
  }

  getDOM(coordinate: Coordinate) {
    let { lng, lat } = coordinate;
    lng = this.getWrapNum(lng);
    const formatDM = dm => {
      const { degrees, minutes, direction } = dm;
      return `${degrees}° ${minutes}' ${direction}`;
    };
    const value = `${formatDM(dd2ddm(lat, 'lat'))} ${formatDM(dd2ddm(lng, 'lng'))}`;
    return value;
  }

  getDMS(coordinate: Coordinate) {
    let { lng, lat } = coordinate;
    lng = this.getWrapNum(lng);
    const value = `${format(dd2dms(lat, 'lat'))} ${format(dd2dms(lng, 'lng'))}`;
    return value;
  }

  getCoorByXY(value?: string) {
    value = this.replaceUnit(value);
    value = value.replace(/‎|°|\s+/g, '');
    const coordinates = value.split(',');
    // @ts-ignore
    return { lng: coordinates[0] * 1, lat: coordinates[1] * 1 };
  }

  getCoorByDD(value?: string) {
    value = this.replaceUnit(value);
    value = value.replace(/‎|°|\s+/g, '');
    value = value.replace(/E|N|W|S/gi, '');
    const coordinates = value.split(',');
    // @ts-ignore
    return { lng: coordinates[1] * 1, lat: coordinates[0] * 1 };
  }

  getCoorByDOM(value?: string) {
    const { latStr, lngStr } = this.getDMLatLng(value);
    if (!latStr || !lngStr) {
      return { lng: NaN, lat: NaN };
    }
    const ddmLng = this.parseDM(lngStr);
    const ddmLat = this.parseDM(latStr);
    const lng = ddm2dd(ddmLng);
    const lat = ddm2dd(ddmLat);
    return { lng, lat };
  }

  getCoorByDMS(value?: string) {
    const { latStr, lngStr } = this.getDMLatLng(value);
    if (!latStr || !lngStr) {
      return { lng: NaN, lat: NaN };
    }
    const ddmLng = parse(lngStr);
    const ddmLat = parse(latStr);
    const lng = dms2dd(ddmLng);
    const lat = dms2dd(ddmLat);
    return { lng, lat };
  }

  getCoorByUtm(value?: string) {
    const [zone, easting, northing] = value.split(' ');
    let zoneNum: number = parseInt(zone);
    const zoneLetter = Object.is(zoneNum, NaN) ? zone : zone.replace(zoneNum + '', '');
    const { latitude, longitude } = utm.toLatLon(easting, northing, zoneNum, zoneLetter);
    return { lng: longitude, lat: latitude };
  }

  replaceUnit(value?: string) {
    value = value.replace(/º/g, '°');
    value = value.replace(/\'\'/g, '"');
    return value;
  }

  getDMLatLng(value: string) {
    const unit = ['N', 'S'];
    let index = value.indexOf(unit[0]);
    if (index < 0) {
      index = value.indexOf(unit[1]);
    }
    if (index < -1) {
      return { latStr: '', lngStr: '' };
    }
    const latStr = value.slice(0, index + 1).trim();
    const lngStr = value.slice(index + 1).trim();
    return { latStr, lngStr };
  }

  parseDM(value: string) {
    const pattern = /^([0-1]?[0-9]?[0-9])°\s([0-5]?[0-9](?:.\d+)?)'\s?(N|S|E|W)?$/;
    const results = pattern.exec(value);
    if (!results) {
      throw new Error(this.$t('coordinateConversion.errorCoordinate'));
    }
    const [degrees, minutes, direction] = results.slice(1, 4);
    const dm = {
      degrees: parseInt(degrees, 10),
      minutes: parseFloat(minutes)
    };
    return direction ? Object.assign(dm, { direction }) : dm;
  }
}
export default SmCoordinateConversion;
</script>
