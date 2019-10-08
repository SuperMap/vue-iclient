<template>
  <div class="sm-component-search sm-component-tdtSearch" :style="getTextColorStyle">
    <div
      v-if="showIcon && mode === 'control'"
      class="sm-component-search__toggle-icon"
      :style="[{'--icon-color--hover': colorGroupsData[0]}, getBackgroundStyle]"
      @click="showSearch = !showSearch; showIcon = !showIcon"
    >
      <i class="sm-components-icons-preview"></i>
    </div>
    <transition name="sm-component-zoom-in" @after-leave="showIcon = !showIcon">
      <div
        v-show="showSearch || mode === 'toolBar'"
        class="sm-component-search__content sm-component-tdtSearch__content"
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
            <i v-if="prefixType==='search'" class="sm-components-icons-preview"></i>
            <a-icon v-else :type="prefixType"></a-icon>
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
            @mouseenter="isHover = !isHover"
            @mouseleave="isHover = !isHover"
            @keyup="changeResultHover"
          >
            <a-icon
              v-show="isHover && searchKey"
              slot="suffix"
              type="close-circle"
              :style="getColorStyle(0)"
              @click="inputValueCleared"
              @mouseenter="isHover = !isHover"
              @mouseleave="isHover = !isHover"
            />
          </a-input>
        </div>
        <div :style="[getBackgroundStyle]">
          <div v-if="resultSuggestions" class="sm-component-search__result">
            <ul class="sm-component-tdtSearch__suggestions">
              <li
                v-for="(item, i) in searchResult"
                :key="i"
                :title="item.name"
                :class="{'active': hoverIndex === i }"
                @click="searchResultListClicked(item.name)"
                @mouseenter="changeChosenResultStyle"
                @mouseleave="resetChosenResultStyle"
              >
                <span class="name">{{ item.name }}</span>
                <span v-if="showAddress(item.name, item.address)" class="address">{{ item.address }}</span>
              </li>
            </ul>
          </div>

          <component :is="componentId" v-else v-bind="componentProps" v-on="componentListeners"></component>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import Theme from '../../../common/_mixin/theme';
import MapGetter from '../../_mixin/map-getter';
import Control from '../../_mixin/control';
import TdtSearchViewModel from './TdtSearchViewModel';
import PointsResult from '../results/PointsResult';
import LinesResult from '../results/LinesResult';
import AreaResult from '../results/AreaResult';
import StatisticsResult from '../results/StatisticsResult';
import NothingResult from '../results/NothingResult';
import isEqual from 'lodash.isequal';

export default {
  name: 'SmTdtSearch',
  components: {
    PointsResult,
    LinesResult,
    AreaResult,
    StatisticsResult,
    NothingResult
  },
  mixins: [Control, MapGetter, Theme],
  props: {
    data: {
      type: Object,
      default() {
        return {
          searchUrl: 'http://api.tianditu.gov.cn/search',
          tk: ''
        };
      }
    },
    mode: {
      type: String,
      default: 'control',
      validator(mode) {
        return ['control', 'toolBar'].includes(mode);
      }
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
      isHover: false,
      showSearch: true,
      showIcon: false,
      isInputing: false,
      isSuggestion: false,
      hoverIndex: undefined,
      componentId: null,
      componentProps: {},
      componentListeners: {},
      openPurePoiSearch: false
    };
  },
  computed: {
    resultSuggestions() {
      if (!this.isSuggestion) {
        return false;
      }
      return this.searchResult.length > 0;
    },
    showAddress() {
      return function(name, address) {
        return name && address && name.length < 23 && name.length + address.length < 23;
      };
    }
  },
  watch: {
    textColorsData: {
      handler() {
        this.changeSearchInputStyle();
        const results = this.$el.querySelectorAll('.sm-component-search__result li');
        for (let result of results) {
          result.style.color = this.getTextColor;
        }
      }
    },
    data(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.viewModel && this.viewModel.setData(this.data);
      }
    }
  },
  created() {
    this.showSearch = !this.collapsed;
    this.showIcon = this.collapsed;
  },
  mounted() {
    this.changeSearchInputStyle();
  },
  loaded() {
    this.viewModel = new TdtSearchViewModel(this.map, this.$props);
    this.viewModel.on('get-transit-data-succeeded', ({ data }) => {
      this.$set(this.componentProps, 'busData', Object.assign({}, data));
    });
    this.viewModel.on('search-selected-info', this.searchSelectedInfo);
  },
  removed() {
    this.clearResult(true);
    this.viewModel && this.viewModel.clear();
  },
  beforeDestroy() {
    this.$message.destroy();
    this.marker && this.marker.remove() && (this.marker = null);
    this.$options.removed.call(this);
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
    search(params) {
      this.clearResult();
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) return;
      if (this.searchKey) {
        this.prefixType = 'loading';
        this.viewModel
          .search(this.searchKey, params)
          .then(res => {
            if (res && res.suggests) {
              this.searchSucceeded(res.suggests);
              return;
            }
            this.searchFailed();
          })
          .catch(error => {
            error && this.searchFailed(error);
          });
      } else {
        this.$message.warning(this.$t('search.noKey'));
      }
    },
    searchInput(e) {
      if (!this.isInputing) {
        if (this.searchKey) {
          this.isSuggestion = true;
          this.search(false);
        } else {
          this.inputValueCleared(false);
        }
      }
    },
    searchButtonClicked() {
      if (!this.searchKey) {
        this.$message.warning(this.$t('search.noKey'));
        return;
      }
      this.getResultDetail(this.searchKey);
    },
    /**
     * 清除搜索结果。
     */
    clearResult(isClear) {
      this.$message.destroy();
      isClear && (this.searchKey = null);
      this.searchResult = [];
      this.prefixType = 'search';
      this.hoverIndex = undefined;
      this.componentId = null;
      this.componentProps = {};
      this.componentListeners = {};
    },
    inputValueCleared(emitEvent = true) {
      this.clearResult(true);
      this.viewModel && this.viewModel.clear();
      emitEvent && this.$emit('clear-search-result');
    },
    searchResultListClicked(searchKey) {
      this.getResultDetail(searchKey);
    },
    getResultDetail(searchKey, paramsData, openPurePoiSearch) {
      this.isSuggestion = false;
      const params = paramsData || {
        queryType: '1',
        queryTerminal: 10000
      };
      if (!params.mapBound) {
        params.mapBound = this.viewModel._toBBoxString();
      }
      const searchKeyWord = searchKey || this.searchKey;
      searchKey && (this.searchKey = searchKey);
      this.changeOpenPurePoiSearch(openPurePoiSearch);
      this.viewModel.getFeatureInfo(searchKey || this.searchKey, params).then(res => {
        if (!res) return;
        const { type, result } = res;
        let componentProps = {
          data: result.data,
          prompt: result.prompt,
          keyWord: searchKeyWord,
          count: result.count,
          mapBound: params.mapBound
        };
        let componentListeners = {};
        switch (type) {
          case 'Point':
            this.componentId = 'PointsResult';
            componentProps.openPurePoiSearch = this.openPurePoiSearch;
            componentProps.specifyAdminSearch = params && !!params.specifyAdminCode;
            componentListeners['show-point-popup'] = this.generatePopup;
            componentListeners['set-highlight-icon'] = this.setHighlightIcon;
            componentListeners['change-pagination'] = this.getResultDetail;
            break;
          case 'LineString':
            this.componentId = 'LinesResult';
            componentListeners['show-point-popup'] = this.generatePopup;
            componentListeners['search-points-result'] = this.getResultDetail;
            componentListeners['show-line-detail'] = this.showLineDetail;
            componentListeners['reset-line-source'] = this.resetSource;
            break;
          case 'Polygon':
            this.componentId = 'AreaResult';
            break;
          case 'Statistics':
            this.componentId = 'StatisticsResult';
            componentProps.data = result.data.allAdmins;
            componentProps.priorityCitys = result.data.priorityCitys;
            componentListeners['search-points-result'] = this.getResultDetail;
            break;
          default:
            this.componentId = 'NothingResult';
            componentListeners['search-points-result'] = this.getResultDetail;
            break;
        }
        this.componentProps = componentProps;
        this.componentListeners = componentListeners;
      });
    },
    searchSucceeded(result) {
      this.$message.destroy();
      this.searchResult = result;
      this.prefixType = 'search';
      this.searchResult.length < 1 && this.$message.warning(this.$t('search.noResult'));
      this.$emit('search-succeeded', { searchResult: this.searchResult });
    },
    searchFailed(e) {
      this.clearResult();
      this.prefixType = 'search';
      this.$message.warning(this.$t('search.noResult'));
      this.$emit('search-failed', e);
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
      const len = this.searchResult.length;
      let hoverIndex = this.hoverIndex;
      if (this.isNumber(hoverIndex) && hoverIndex < len - 1) {
        this.hoverIndex = hoverIndex + 1;
      } else {
        this.hoverIndex = 0;
      }
      const selectedItem = this.searchResult[this.hoverIndex];
      this.searchKey = selectedItem.name;
    },
    upChoose() {
      const len = this.searchResult.length;
      let hoverIndex = this.hoverIndex;
      if (this.isNumber(hoverIndex) && hoverIndex > 0) {
        this.hoverIndex = hoverIndex - 1;
      } else {
        this.hoverIndex = Math.max(len - 1, 0);
      }
      const selectedItem = this.searchResult[this.hoverIndex];
      this.searchKey = selectedItem.name;
    },
    changeResultHover(e) {
      const { keyCode } = e;
      if (!this.isSuggestion) return;

      if (keyCode === 38) {
        this.upChoose();
      } else if (keyCode === 40) {
        this.downChoose();
      }
    },
    generatePopup({ coordinates, data, from }) {
      this.viewModel && this.viewModel.showPointPopup(coordinates, data, from);
    },
    setHighlightIcon(hotPointID) {
      this.viewModel && this.viewModel.setHighlightIcon(hotPointID);
    },
    showLineDetail(uuid) {
      this.viewModel && this.viewModel.showLineDetail(uuid);
    },
    resetSource() {
      this.viewModel && this.viewModel.reset();
    },
    changeOpenPurePoiSearch(openPurePoiSearch) {
      this.openPurePoiSearch = openPurePoiSearch;
    }
  }
};
</script>
