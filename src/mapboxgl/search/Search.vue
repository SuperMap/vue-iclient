<template>
  <div
    id="sm-component-search"
    class="sm-component-search"
    :style="[getTextColorStyle, getBackgroundStyle]"
  >
    <div class="sm-component-search__input">
      <a-input
        v-model="searchKey"
        class="sm-component-search__a-input"
        :placeholder="$t('search.inputPlaceHolder')"
        :style="[getBackgroundStyle]"
        @pressEnter="searchButtonClicked"
        @mouseenter="handleInputHover"
        @mouseleave="handleInputHover"
      >
        <a-icon
          slot="prefix"
          :type="prefixType"
          :style="getColorStyle(0)"
          @click="searchButtonClicked"
        />
        <a-icon
          v-show="isHover && searchKey"
          slot="suffix"
          type="close-circle"
          :style="getColorStyle(0)"
          @click="inputValueCleared"
          @mouseenter="handleInputHover"
          @mouseleave="handleInputHover"
        />
      </a-input>
    </div>
    <div v-show="getResultLength" class="sm-component-search__result" :style="[getBackgroundStyle]">
      <div v-for="(result,index) in searchResult" :key="index" class="sm-component-search__panel">
        <span
          v-if="result.source"
          class="sm-component-search__panel-header"
          :style="getColorStyle(0)"
        >{{ result.source }}</span>
        <div v-if="result.result" class="sm-component-search__panel-body">
          <ul>
            <li
              v-for="(item,i) in result.result"
              :key="i"
              :title="item.filterVal || item.address"
              @click="searchResultListClicked"
              @mouseenter="changeChosenResultStyle"
              @mouseleave="resetChosenResultStyle"
            >{{ item.filterVal || item.address }}</li>
          </ul>
        </div>
      </div>
    </div>
    <TablePopup v-show="false" ref="searchTablePopup" v-bind="tablePopupProps"/>
  </div>
</template>
<script>
import Theme from '../../common/_mixin/theme';
import MapGetter from '../_mixin/map-getter';
import Control from '../_mixin/control';

import SearchViewModel from './SearchViewModel';
import TablePopup from '../../common/table-popup/TablePopup';
// import iPortalDataParameter from "../commontypes/iPortalDataParameter";
// import RestDataParameter from "../commontypes/RestDataParameter";
// import RestMapParameter from "../commontypes/RestMapParameter";
// import AddressMatchParameter from "../commontypes/AddressMatchParameter";

// let validators = (value, propType) => {
//   let valid = true;
//   value.forEach(item => {
//     if (!(item instanceof propType)) {
//       valid = false;
//     }
//   });
//   return valid;
// };
/**
 * @module Search
 * @category Components
 * @desc 搜索组件。
 * @vue-prop {(Number|String)} [maxFeatures=8] - 最多可返回的要素数量，最大值为 100。
 * @vue-prop {Array} [layerNames] - 地图图层搜索配置，如：'['UNIQUE-民航数']'。
 * @vue-prop {RestMapParameter} [restMap] - iServer 地图服务搜索配置。
 * @vue-prop {RestDataParameter} [restData] - iServer 数据服务搜索配置。
 * @vue-prop {iPortalDataParameter} [iportalData] - iPortal 数据搜索配置。
 * @vue-prop {AddressMatchParameter} [addressMatch] - iServer 地址匹配服务搜索配置。
 * @vue-prop {Object} [onlineLocalSearch] - online 本地搜索配置。
 * @vue-prop {Boolean} [onlineLocalSearch.enable=true] - 是否开启 online 本地搜索。
 * @vue-computed {Number} getResultLength - 获取结果数据长度。
 */
export default {
  name: 'SmSearch',
  components: {
    TablePopup
  },
  mixins: [Control, MapGetter, Theme],
  props: {
    maxFeatures: {
      type: [Number, String],
      default: 8
    },
    layerNames: {
      type: Array
    },
    onlineLocalSearch: {
      type: Object,
      default() {
        return {
          enable: true,
          city: '北京市'
        };
      }
    },
    restMap: {
      type: Array
      // validator(value) {
      //   return validators(value, RestMapParameter);
      // }
    },
    restData: {
      type: Array
      // validator(value) {
      //   return validators(value, RestDataParameter);
      // }
    },
    iportalData: {
      type: Array
      // validator(value) {
      //   return validators(value, iPortalDataParameter);
      // }
    },
    addressMatch: {
      type: Array
      // validator(value) {
      //   return validators(value, AddressMatchParameter);
      // }
    }
  },
  data() {
    return {
      searchKey: null,
      searchResult: [],
      prefixType: 'search',
      isHover: false,
      tablePopupProps: {}
    };
  },
  computed: {
    getResultLength() {
      return this.searchResult.length > 0;
    }
  },
  watch: {
    textColorsData: {
      handler() {
        this.changeSearchInputStyle();
        const results = this.$el.querySelectorAll('.sm-component-search__panel li');
        for (let result of results) {
          result.style.color = this.getTextColor;
        }
      }
    }
  },
  mounted() {
    this.changeSearchInputStyle();
  },
  loaded() {
    this.viewModel = new SearchViewModel(this.map, this.$props);
    this.oldSearchTaskId = null;
  },
  removed() {
    this.clearResult(true);
  },
  beforeDestroy() {
    this.$message.destroy();
    this.marker && this.marker.remove() && (this.marker = null);
  },
  methods: {
    changeSearchInputStyle() {
      const serachInput = this.$el.querySelector('.ant-input');
      serachInput.style.color = this.getTextColor;
    },
    changeChosenResultStyle(e) {
      const { target } = e;
      target.style.color = this.getColorStyle(0).color;
    },
    resetChosenResultStyle(e) {
      const { target } = e;
      target.style.color = this.getTextColor;
    },
    /**
     * 清除搜索结果。
     */
    clearResult(isClear) {
      this.$message.destroy();
      isClear && (this.searchKey = null);
      this.searchResult = [];
      this.marker && this.marker.remove() && (this.marker = null);
      this.prefixType = 'search';
    },
    searchButtonClicked() {
      if (!this.viewModel) {
        this.nonMapTip();
        return;
      }
      this.search();
    },
    /**
     * 开始搜索。
     * @param {String} searchKey - 搜索关键字。
     */
    search(searchKey) {
      this.clearResult();
      let { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch } = this.$props;
      if (
        (layerNames && layerNames.length > 0) ||
        onlineLocalSearch.enable ||
        (restMap && restMap.length > 0) ||
        (restData && restData.length > 0) ||
        (iportalData && iportalData.length > 0) ||
        (addressMatch && addressMatch.length > 0)
      ) {
        if (searchKey || this.searchKey) {
          this.searchTaskId = this.viewModel.search(searchKey || this.searchKey);
          this.regiterEvents();
          this.prefixType = 'loading';
        } else {
          this.$message.warning(this.$t('search.noKey'));
        }
      } else {
        this.$message.warning('请设置搜索源！');
      }
    },
    inputValueCleared() {
      this.clearResult(true);
    },
    searchResultListClicked(e) {
      let filter = e.target.innerHTML;
      this.marker && this.marker.remove();
      this.marker = null;
      this.linkageFeature(filter, e.target);
    },
    linkageFeature(filter, element) {
      let sourceTarget = element.parentElement.parentElement.previousElementSibling;
      let sourceName = sourceTarget.innerHTML;

      let popupData = this.viewModel.getFeatureInfo(this.searchResult, filter, sourceName);

      if (popupData.info.length >= 1) {
        let state = {
          columns: [
            { title: this.$t('search.attribute'), dataIndex: 'attribute', width: 80 },
            { title: this.$t('search.attributeValue'), dataIndex: 'attributeValue', width: 150 }
          ],
          data: popupData.info
        };
        this.tablePopupProps = { ...state };

        this.$nextTick(() => {
          this.marker = this.viewModel.addMarker(popupData.coordinates, this.$refs.searchTablePopup.$el);
        });
      }
    },
    regiterEvents() {
      this.searchKey >= 1 && this.viewModel.off('searchsucceeded' + (this.searchTaskId - 1));
      this.viewModel.on('searchsucceeded' + this.searchTaskId, e => {
        /**
         * @event searchSucceeded
         * @desc 搜索成功后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('search-succeeded', { searchResult: e.result });
        this.searchResult = e.result;
        this.prefixType = 'search';
        this.searchResult.length < 1 && this.$message.warning(this.$t('search.noResult'));
      });
      this.viewModel.on('searchfailed' + this.searchTaskId, e => {
        /**
         * @event searchFailed
         * @desc 搜索失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.prefixType = 'search';
        this.$message.warning(this.$t('search.noResult'));
        this.$emit('search-failed', e);
      });
    },
    handleInputHover() {
      this.isHover = !this.isHover;
    }
  }
};
</script>
