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
    <sm-card
      :style="[collapseCardBackgroundStyle]"
      class="sm-component-coordinate-conversion__sm-card"
    >
      <div class="sm-component-coordinate-conversion__content">
        <sm-select
          v-model="activeFormat"
          :placeholder="$t('measure.selectPlaceholder')"
          class="sm-component-coordinate-conversion__format"
          :style="getTextColorStyle"
          :get-popup-container="getPopupContainer"
          :dropdownMatchSelectWidth="true"
          size="small"
          @change="changeFormat"
        >
          <sm-select-option
            v-for="(value, key, index) in formatOptions"
            :key="index"
            :title="value"
            :value="key"
          >{{ value }}</sm-select-option>
        </sm-select>
        <sm-input
          v-model="inputValue"
          :class="['sm-component-coordinate-conversion__a-input']"
          :placeholder="activeDisplayFormat || $t('coordinateConversion.inputPlaceHolder')"
          size="small"
          allowClear
          @input="handleInput"
          @blur="handleBlur"
        ></sm-input>
        <div class="sm-component-coordinate-conversion__icons">
          <sm-icon
            type="copy"
            :class="[isCapture?'sm-component-coordinate-conversion__copy':'sm-component-coordinate-conversion__disabled']"
            :data-clipboard-text="isCapture?inputValue:''"
            :title="$t('coordinateConversion.copy')"
          ></sm-icon>
          <sm-icon
            type="edit"
            :class="[isCapture && 'sm-component-coordinate-conversion__hover']"
            :title="$t('coordinateConversion.capture')"
            @click="handleCapture"
          ></sm-icon>
          <sm-icon
            v-if="isLocation"
            type="environment"
            :title="$t('coordinateConversion.location')"
            @click="handleLocation"
          ></sm-icon>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>
<script>
import Theme from '../../../../common/_mixin/Theme';
import MapGetter from '../../../_mixin/map-getter';
import Control from '../../../_mixin/control';
import SmIcon from '../../../../common/icon/Icon';
import SmInput from '../../../../common/input/Input';
import SmSelect from '../../../../common/select/Select';
import BaseCard from '../../../../common/_mixin/Card';
import SmCard from '../../../../common/card/Card';
import SmCollapse from '../../../../common/collapse/Collapse';
import CoordinateConversionViewModel from './CoordinateConversionViewModel';
import { getProjection } from '../../../../common/_utils/epsg-define';
import ClipboardJS from 'clipboard';
import proj4 from 'proj4';
import { CoordinateConverter } from 'geographic-coordinate-converter/coordinate-converter';

const utm = require('utm');

const displayFormat = {
  XY: 'X°‎, Y°‎',
  BASEMAP: `X Y`,
  Mercator: `X Y`,
  UTM: `ZB X Y`,
  DD: 'Y° ‎N, X° ‎E',
  DOM: `Y°‎ A' N, X°‎ B' E`,
  DMS: `Y°‎ A' B" N, X°‎ C' D" E`
};

export default {
  name: 'SmCoordinateConversion',
  components: {
    SmIcon,
    SmInput,
    SmSelect,
    SmCard,
    SmCollapse
  },
  mixins: [MapGetter, Control, Theme, BaseCard],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: false
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-change'
    },
    isLocation: {
      type: Boolean,
      default: true
    },
    formats: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      clickCaptureTimes: 0,
      defaultFormatOptions: {
        XY: this.$t('unit.XY'),
        BASEMAP: this.$t('unit.BASEMAP'),
        Mercator: this.$t('unit.Mercator'),
        UTM: this.$t('unit.UTM'),
        DD: this.$t('unit.DD'),
        DOM: this.$t('unit.DOM'),
        DMS: this.$t('unit.DMS')
      },
      formatOptions: { ...this.defaultFormatOptions },
      activeFormat: 'XY',
      displayFormat,
      activeDisplayFormat: 'X°‎, Y°‎',
      inputValue: '',
      iconValue: ''
    };
  },
  computed: {
    isCapture() {
      return this.clickCaptureTimes % 2 !== 0;
    }
  },
  watch: {
    isCapture() {
      if (this.isCapture) {
        this.viewModel._bindCapture();
      } else {
        this.viewModel._bindHover();
      }
    },
    formats: {
      handler() {
        const newDisplayFormat = { ...displayFormat };
        this.formatOptions = { ...this.defaultFormatOptions };
        if (this.formats) {
          for (let title in this.formats) {
            newDisplayFormat[title] = '';
            this.formatOptions[title] = title;
          }
        }
        this.displayFormat = newDisplayFormat;
      },
      immediate: true
    }
  },
  created() {
    // 复制插件
    let clipboard = (this.clipboard = new ClipboardJS('.sm-component-coordinate-conversion__copy'));
    clipboard.on('success', () => {
      this.$message.success(this.$t('success.copySucccess'));
    });
    this.viewModel = new CoordinateConversionViewModel();
    this.viewModel.on('getcoordinate', res => {
      const { coordinate } = res;
      this.coordinate = coordinate;
      this.inputValue = this.formatCoordinate(this.coordinate);
    });
  },
  beforeDestroy() {
    this.clipboard && this.clipboard.destroy();
  },
  methods: {
    getPopupContainer() {
      return this.$el.querySelector('.sm-component-coordinate-conversion__content');
    },
    handleCapture() {
      this.clickCaptureTimes++;
    },
    handleInput(e) {
      if (!this.isCapture) {
        this.handleCapture();
      }
    },
    handleBlur(e) {
      this.coordinate = this.reverseCoordinateFormat(e.target.value);
    },
    handleLocation(val, map = this.map) {
      if (!this.isCapture) {
        this.handleCapture();
      }
      const { lng, lat } = this.coordinate;
      this.viewModel._addMarker([lng, lat]);
      this.viewModel._flyTo([lng, lat]);
    },
    changeFormat(val) {
      this.activeDisplayFormat = this.displayFormat[val];
      this.inputValue = this.formatCoordinate(this.coordinate);
    },
    formatCoordinate(coordinate, format = this.activeDisplayFormat, map = this.map) {
      switch (this.activeFormat) {
        case 'XY':
          return this.getXY(coordinate, format);
        case 'DD':
          return this.getDD(coordinate, format);
        case 'DOM':
          return this.getDOM(coordinate, format);
        case 'DMS':
          return this.getDMS(coordinate, format);
        case 'BASEMAP':
          return this.getBaseMapCoordinate(coordinate, format);
        case 'Mercator':
          return this.getMercatorCoordinate(coordinate, format);
        case 'UTM':
          let { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
            coordinate.lat,
            this.getWrapNum(coordinate.lng)
          );
          return `${zoneNum}${zoneLetter} ${parseInt(easting)} ${parseInt(northing)}`;
        default:
          const formatFn =
            (this.formats && this.formats[this.activeFormat] && this.formats[this.activeFormat].format) || this.getXY;
          return formatFn(coordinate, format);
      }
    },
    reverseCoordinateFormat(value = this.inputValue, format = this.activeDisplayFormat) {
      value = value.replace(/^\s+|\s+$ /, '');
      let coor = value.split(' ');
      switch (this.activeFormat) {
        case 'XY':
          return this.getCoorByXY(value, format);
        case 'DD':
          return this.getCoorByDD(value, format);
        case 'DOM':
          return this.getCoorByDOM(value, format);
        case 'DMS':
          return this.getCoorByDMS(value, format);
        case 'BASEMAP':
          coor = { lng: coor[0] * 1, lat: coor[1] * 1 };
          return this.getEpsgCoordinate(coor, 'EPSG:4326', this.getEpsgCode());
        case 'Mercator':
          coor = { lng: coor[0] * 1, lat: coor[1] * 1 };
          return this.getEpsgCoordinate(coor, 'EPSG:4326', 'EPSG:3857');
        case 'UTM':
          const [zone, northing, easting] = value.split(' ');
          let zoneNum = parseInt(zone);
          const zoneLetter = Object.is(zoneNum, NaN) ? zone : zone.replace(zoneNum, '');
          const { latitude, longitude } = utm.toLatLon(easting, northing, zoneNum, zoneLetter);
          return { lng: longitude, lat: latitude };
        default:
          const toWGS84 =
            (this.formats && this.formats[this.activeFormat] && this.formats[this.activeFormat].toWGS84) ||
            this.getCoorByXY;
          return toWGS84(value, format);
      }
    },
    getMercatorCoordinate(coordinate, format) {
      const { lng, lat } = this.getEpsgCoordinate(coordinate, 'EPSG:3857');
      return `${lng.toFixed(3)} ${lat.toFixed(3)}`;
    },
    getBaseMapCoordinate(coordinate, format) {
      const { lng, lat } = this.getEpsgCoordinate(coordinate);
      return `${lng.toFixed(3)} ${lat.toFixed(3)}`;
    },
    getEpsgCoordinate(coordinate, toEpsgCode, sourceEpsgCode = 'EPSG:4326') {
      const { lng, lat } = coordinate;
      toEpsgCode = toEpsgCode || this.getEpsgCode();
      const toProjection = getProjection(toEpsgCode);
      const sourceProjection = getProjection(sourceEpsgCode);
      const coor = sourceEpsgCode === toEpsgCode ? [lng, lat] : proj4(sourceProjection, toProjection, [lng, lat]);
      return { lng: coor[0], lat: coor[1] };
    },
    getEpsgCode(map = this.map) {
      if (!map) {
        return '';
      }
      return this.map.getCRS().epsgCode;
    },
    getWrapNum(x, includeMax = true, includeMin = true, range = [-180, 180]) {
      var max = range[1];
      var min = range[0];
      var d = max - min;
      if (x === max && includeMax) {
        return x;
      }
      if (x === min && includeMin) {
        return x;
      }
      var tmp = (((x - min) % d) + d) % d;
      if (tmp === 0 && includeMax) {
        return max;
      }
      return ((((x - min) % d) + d) % d) + min;
    },
    getWE(lng) {
      if (lng === 0) {
        return '';
      }
      return lng > 0 ? 'E' : 'W';
    },
    getNS(lat) {
      if (lat === 0) {
        return '';
      }
      return lat > 0 ? 'N' : 'S';
    },
    getXY(coordinate, format) {
      let { lng, lat } = coordinate;
      lat = lat.toFixed(7) * 1;
      lng = this.getWrapNum(lng).toFixed(7) * 1;
      let XY = format.replace('X', lng);
      XY = XY.replace('Y', lat);
      return XY;
    },
    getDD(coordinate, format) {
      let { lng, lat } = coordinate;
      lng = this.getWrapNum(lng);
      lat = lat.toFixed(7) * 1;
      lng = this.getWrapNum(lng).toFixed(7) * 1;
      let XY = format.replace('X', lng);
      XY = XY.replace('Y', lat);
      XY = XY.replace('E', this.getWE(lng));
      XY = XY.replace('N', this.getNS(lat));
      return XY;
    },
    getDOM(coordinate, format) {
      let { lng, lat } = coordinate;
      lng = this.getWrapNum(lng);
      const value = CoordinateConverter.fromDecimal([lat, lng]).toDegreeMinutes();
      return this.replaceUnit(value);
    },
    getDMS(coordinate, format) {
      let { lng, lat } = coordinate;
      lng = this.getWrapNum(lng);
      const value = CoordinateConverter.fromDecimal([lat, lng]).toDegreeMinutesSeconds();
      return this.replaceUnit(value);
    },
    getCoorByXY(value, format) {
      value = this.replaceUnit(value);
      value = value.replace(/‎|°|\s+/g, '');
      const coordinates = value.split(',');
      return { lng: coordinates[0] * 1, lat: coordinates[1] * 1 };
    },
    getCoorByDD(value, format) {
      value = this.replaceUnit(value);
      value = value.replace(/‎|°|\s+/g, '');
      value = value.replace(/E|N|W|S/gi, '');
      const coordinates = value.split(',');
      return { lng: coordinates[1] * 1, lat: coordinates[0] * 1 };
    },
    getCoorByDOM(value, format) {
      value = this.reverseUnit(value);
      return CoordinateConverter.fromDegreeMinutes(value);
    },
    getCoorByDMS(value, format) {
      value = this.reverseUnit(value);
      return CoordinateConverter.fromDegreeMinutesSeconds(value);
    },
    replaceUnit(value) {
      value = value.replace(/º/g, '°');
      value = value.replace(/\'\'/g, '"');
      return value;
    },
    reverseUnit(value) {
      value = value.replace(/°/g, 'º');
      value = value.replace(/\"/g, "''");
      value = value.replace(/‎|,/g, '');
      return value;
    }
  }
};
</script>
