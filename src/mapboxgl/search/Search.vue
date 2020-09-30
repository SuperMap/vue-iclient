<template>
  <div id="sm-component-search" class="sm-component-search" :style="getTextColorStyle">
    <div
      v-if="showIcon && mode === 'control'"
      class="sm-component-search__toggle-icon"
      :style="[{'--icon-color--hover': colorGroupsData[0]}, getBackgroundStyle]"
      @click="showSearch = !showSearch; showIcon = !showIcon"
    >
      <a-icon type="search" />
    </div>
    <transition name="sm-component-zoom-in" @after-leave="showIcon = !showIcon">
      <div
        v-show="showSearch || mode === 'toolBar'"
        class="sm-component-search__content"
        :style="[{'transform-origin': position.includes('left') ? 'top left' : 'top right'}, getBackgroundStyle]"
      >
        <div class="sm-component-search__input">
          <div
            v-if="mode === 'control'"
            class="sm-component-search__arrow-icon"
            :style="{ float: position.includes('left') ? 'right' : 'left'}"
            @click="showSearch = !showSearch"
          >
            <a-icon :type="position.includes('left') ? 'double-left' : 'double-right'" />
          </div>
          <div
            :class="['sm-component-search__search-icon', { 'right': position.includes('right') }]"
            :style="[getBackgroundStyle, getColorStyle(0)]"
            @click="searchButtonClicked"
          >
            <a-icon :type="prefixType" />
          </div>
          <a-input
            v-model="searchKey"
            :class="['sm-component-search__a-input', { 'toolBar-input': mode === 'toolBar' }]"
            :placeholder="$t('search.inputPlaceHolder')"
            :style="[getBackgroundStyle]"
            @input="searchInput"
            @compositionstart="isInputing = true"
            @compositionend="isInputing = false"
            @pressEnter="searchButtonClicked"
            @focus="isActive = !isActive"
            @blur="isActive = !isActive"
            @keyup="changeResultHover"
          >
            <a-icon
              v-show="isActive"
              slot="suffix"
              type="close-circle"
              :style="getColorStyle(0)"
              @mousedown="inputValueCleared"
            />
          </a-input>
        </div>
        <div
          v-show="resultSuggestions"
          class="sm-component-search__result"
          :style="[getBackgroundStyle]"
        >
          <div
            v-for="(result,index) in searchResult"
            :key="index"
            class="sm-component-search__panel"
          >
            <span
              v-if="result.source && showTitle && result.result.length"
              class="sm-component-search__panel-header"
              :style="getColorStyle(0)"
            >{{ result.source }}</span>
            <div v-if="result.result" class="sm-component-search__panel-body">
              <ul :class="{'noMarginBottom': !showTitle}">
                <li
                  v-for="(item,i) in result.result"
                  :key="i"
                  :title="item.filterVal || item.name || item.address"
                  :class="{'active': keyupHoverInfo.groupIndex === index && keyupHoverInfo.hoverIndex === i }"
                  @click="searchResultListClicked(item, $event)"
                  @mouseenter="changeChosenResultStyle"
                  @mouseleave="resetChosenResultStyle"
                >{{ item.filterVal || item.name || item.address }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <TablePopup
      v-show="false"
      ref="searchTablePopup"
      v-bind="tablePopupProps"
      :text-color="textColor"
      :background="background"
    />
  </div>
</template>
<script>
import Theme from '../../common/_mixin/theme';
import MapGetter from '../_mixin/map-getter';
import Control from '../_mixin/control';

import SearchViewModel from './SearchViewModel';
import TablePopup from '../../common/table-popup/TablePopup';
import { getColorWithOpacity } from '../../common/_utils/util';
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
    },
    mode: {
      type: String,
      default: 'control',
      validator(mode) {
        return ['control', 'toolBar'].includes(mode);
      }
    },
    openSearchSuggestion: {
      type: Boolean,
      default: false
    },
    alwaysCenter: {
      type: Boolean,
      default: true
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    showResult: {
      type: Boolean,
      default: true
    },
    resultRender: {
      type: Function
    },
    collapsed: {
      // 是否折叠组件
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchKey: null,
      searchResult: [],
      prefixType: 'search',
      isActive: false,
      tablePopupProps: {},
      showSearch: true,
      showIcon: false,
      isInputing: false,
      isSuggestion: false,
      keyupHoverInfo: {
        groupIndex: undefined,
        hoverIndex: undefined
      }
    };
  },
  computed: {
    resultSuggestions() {
      if (!this.isSuggestion && !this.showResult) {
        return false;
      }
      return this.searchResult.length > 0;
    },
    popupBackground() {
      return this.backgroundData ? getColorWithOpacity(this.backgroundData, 0.5) : this.backgroundData;
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
    },
    backgroundData() {
      this.changeResultPopupArrowStyle();
    }
  },
  created() {
    this.showSearch = !this.collapsed;
    this.showIcon = this.collapsed;
    this.viewModel = new SearchViewModel(this.$props);
  },
  mounted() {
    this.changeSearchInputStyle();
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
    changeResultPopupArrowStyle() {
      const searchResultPopupArrow = document.querySelector('.sm-component-search-result-popup .mapboxgl-popup-tip');
      if (searchResultPopupArrow) {
        searchResultPopupArrow.style.borderTopColor = this.popupBackground;
      }
    },
    /**
     * 清除搜索结果。
     */
    clearResult(isClear) {
      this.$message.destroy();
      isClear && (this.searchKey = null);
      isClear && this.resetLastEvent();
      this.searchResult = [];
      this.marker && this.marker.remove() && (this.marker = null);
      this.prefixType = 'search';
      this.keyupHoverInfo = {
        groupIndex: undefined,
        hoverIndex: undefined
      };
    },
    searchInput(e) {
      if (this.openSearchSuggestion && !this.isInputing) {
        if (this.searchKey) {
          this.isSuggestion = true;
          this.search();
        } else {
          this.inputValueCleared(false);
        }
      }
    },
    searchButtonClicked() {
      this.isSuggestion = false;
      this.search();
    },
    search() {
      this.clearResult();
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) return;
      let { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch } = this.$props;
      if (
        (layerNames && layerNames.length > 0) ||
        onlineLocalSearch.enable ||
        (restMap && restMap.length > 0) ||
        (restData && restData.length > 0) ||
        (iportalData && iportalData.length > 0) ||
        (addressMatch && addressMatch.length > 0)
      ) {
        if (this.searchKey) {
          this.searchTaskId = this.viewModel.search(this.searchKey);
          this.regiterEvents();
          this.prefixType = 'loading';
        } else {
          this.$message.warning(this.$t('search.noKey'));
        }
      } else {
        this.$message.warning(this.$t('search.setSearchSource'));
      }
    },
    inputValueCleared(emitEvent = true) {
      this.clearResult(true);
      this.viewModel && this.viewModel.removed();
      emitEvent && this.$emit('clear-search-result');
    },
    searchResultListClicked(data, event) {
      const searchKey = event.target.innerHTML;
      this.isSuggestion = false;
      this.viewModel.getFeatureInfo(searchKey, data);
    },
    resetLastEvent() {
      if (/\d/.test(this.searchTaskId)) {
        this.viewModel.off('searchsucceeded' + this.searchTaskId);
        this.viewModel.off('searchfailed' + this.searchTaskId);
        this.viewModel.off('set-popup-content' + this.searchTaskId);
        this.viewModel.off('addfeaturefailed' + this.illegalFeatureTip);
        this.viewModel.off('search-selected-info' + this.searchTaskId);
        this.searchTaskId = undefined;
      }
    },
    registerSuccessEvent(searchTaskId) {
      this.viewModel.on('searchsucceeded' + searchTaskId, this.searchSucceeded);
    },
    registerFailedEvent(searchTaskId) {
      this.viewModel.on('searchfailed' + searchTaskId, this.searchFailed);
    },
    regiterEvents() {
      if (this.isNumber(this.searchTaskId)) {
        this.viewModel.off('searchsucceeded' + (this.searchTaskId - 1), this.searchSucceeded);
        this.viewModel.off('searchsucceeded' + (this.searchTaskId - 1), this.searchFailed);
        this.viewModel.off('set-popup-content' + (this.searchTaskId - 1), this.setPopupContent);
        this.viewModel.off('addfeaturefailed' + (this.searchTaskId - 1), this.illegalFeatureTip);
        this.viewModel.off('search-selected-info' + (this.searchTaskId - 1), this.searchSelectedInfo);
      }
      const onTaskId = this.searchTaskId || 0;
      this.registerSuccessEvent(onTaskId);
      this.registerFailedEvent(onTaskId);
      this.viewModel.on('set-popup-content' + onTaskId, this.setPopupContent);
      this.viewModel.on('addfeaturefailed' + onTaskId, this.illegalFeatureTip);
      this.viewModel.on('search-selected-info' + onTaskId, this.searchSelectedInfo);
    },
    searchSucceeded({ result }) {
      /**
       * @event searchSucceeded
       * @desc 搜索成功后触发。
       * @property {Object} e  - 事件对象。
       */
      this.$message.destroy();
      this.searchResult = result;
      this.$emit('search-succeeded', { searchResult: this.searchResult });
      this.prefixType = 'search';
      // this.searchResult.length < 1 && this.$message.warning(this.$t('search.noResult'));
      if (this.isNumber(this.searchTaskId)) {
        this.searchTaskId += 1;
        this.regiterEvents();
      }
    },
    searchFailed(e) {
      /**
       * @event searchFailed
       * @desc 搜索失败后触发。
       * @property {Object} e  - 事件对象。
       */
      this.clearResult();
      this.prefixType = 'search';
      // this.$message.warning(this.$t('search.noResult'));
      this.$emit('search-failed', e);
      if (this.isNumber(this.searchTaskId)) {
        this.searchTaskId += 1;
        this.regiterEvents();
      }
    },
    setPopupContent({ popupData }) {
      if (popupData && popupData.info.length) {
        let state = {
          columns: [
            { title: this.$t('search.attribute'), dataIndex: 'attribute', width: 80 },
            { title: this.$t('search.attributeValue'), dataIndex: 'attributeValue', width: 150 }
          ],
          data: popupData.info
        };
        this.tablePopupProps = { ...state };
      }
      this.$nextTick(() => {
        this.viewModel.setPopupContent(
          popupData.coordinates,
          this.$refs.searchTablePopup.$el,
          this.changeResultPopupArrowStyle
        );
      });
    },
    illegalFeatureTip({ error }) {
      this.$message.destroy();
      this.$message.error(error);
    },
    searchSelectedInfo({ data }) {
      this.prefixType = 'search';
      this.resultRender && this.resultRender(data);
      this.$emit('search-selected-info', data);
    },
    isNumber(num) {
      return /\d/.test(num);
    },
    downChoose() {
      const len = this.searchResult.filter(item => item.result.length).length;
      let { groupIndex = 0, hoverIndex } = this.keyupHoverInfo;
      const groupResult = groupIndex ? this.searchResult[groupIndex].result : this.searchResult[0].result;
      const subLen = groupResult.length;
      groupIndex =
        groupIndex < len - 1 && hoverIndex >= subLen - 1
          ? Math.min(len - 1, groupIndex + 1)
          : groupIndex === len - 1 && hoverIndex === subLen - 1
            ? 0
            : groupIndex;
      if (this.isNumber(hoverIndex) && hoverIndex < subLen - 1) {
        this.keyupHoverInfo.hoverIndex = hoverIndex + 1;
      } else {
        this.keyupHoverInfo.groupIndex = groupIndex;
        this.keyupHoverInfo.hoverIndex = 0;
      }
      const selectedItem = this.searchResult[groupIndex].result[this.keyupHoverInfo.hoverIndex];
      this.searchKey = (selectedItem.filterVal || selectedItem.name || selectedItem.address).split('：')[0];
    },
    upChoose() {
      const len = this.searchResult.filter(item => item.result.length).length;
      let { groupIndex = 0, hoverIndex } = this.keyupHoverInfo;
      groupIndex =
        groupIndex > 0 && !hoverIndex ? Math.max(0, groupIndex - 1) : !groupIndex && !hoverIndex ? len - 1 : groupIndex;
      if (this.isNumber(hoverIndex) && hoverIndex > 0) {
        this.keyupHoverInfo.hoverIndex = hoverIndex - 1;
      } else {
        this.keyupHoverInfo.groupIndex = groupIndex;
        this.keyupHoverInfo.hoverIndex = Math.max(this.searchResult[groupIndex].result.length - 1, 0);
      }
      const selectedItem = this.searchResult[groupIndex].result[this.keyupHoverInfo.hoverIndex];
      this.searchKey = (selectedItem.filterVal || selectedItem.name || selectedItem.address).split('：')[0];
    },
    changeResultHover(e) {
      const { keyCode } = e;
      if (keyCode === 38) {
        this.upChoose();
      } else if (keyCode === 40) {
        this.downChoose();
      }
    }
  }
};
</script>
