<template>
  <div class="sm-search" :style="[getTextColorStyle]">
    <div class="sm-search__input">
      <el-input
        class="sm-search__el-input"
        :placeholder="$t('search.inputPlaceHolder')"
        v-model="searchKey"
        clearable
        @clear="inputValueCleared"
      >
        <div
          slot="prefix"
          class="el-input__icon el-icon-search"
          @click="searchButtonClicked"
          :style="getColorStyle(0)"
        ></div>
      </el-input>
    </div>
    <div class="sm-search__result" v-show="getlength" :style="[getBackgroundStyle]">
      <div v-for="(result,index) in searchResult" :key="index" class="sm-search__panel">
        <span
          class="sm-search__panel-header"
          v-if="result.source"
          :style="getColorStyle(0)"
        >{{result.source}}</span>
        <div class="sm-search__panel-body" v-if="result.result">
          <ul>
            <li
              v-for="(item,index) in result.result"
              :key="index"
              :title="item.filterVal || item.address"
              @click="searchResultListClicked"
              @mouseenter="changeChosenResultStyle"
              @mouseleave="resetChosenResultStyle"
            >{{item.filterVal || item.address}}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Theme from '../mixin/Theme';
import Widget from './Widget';
import SearchViewModel from '../../viewmodel/SearchViewModel';
import TablePopup from './TablePopup';
import iPortalDataParameter from '../commontypes/iPortalDataParameter';
import RestDataParameter from '../commontypes/RestDataParameter';
import RestMapParameter from '../commontypes/RestMapParameter';
import AddressMatchParameter from '../commontypes/AddressMatchParameter';
import Vue from 'vue';

let validators = (value, propType) => {
  let valid = true;
  value.forEach(item => {
    if (!(item instanceof propType)) {
      valid = false;
    }
  });
  return valid;
};

export default {
  name: 'SmSearch',
  extends: Widget,
  relativeMap: true,
  mixins: [Theme],
  props: {
    maxReturn: {
      type: Number,
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
      type: Array,
      validator(value) {
        return validators(value, RestMapParameter);
      }
    },
    restData: {
      type: Array,
      validator(value) {
        return validators(value, RestDataParameter);
      }
    },
    iportalData: {
      type: Array,
      validator(value) {
        return validators(value, iPortalDataParameter);
      }
    },
    addressMatch: {
      type: Array,
      validator(value) {
        return validators(value, AddressMatchParameter);
      }
    }
  },
  data() {
    return {
      searchKey: null,
      searchResult: []
    };
  },
  mounted() {
    this.changeSearchInputStyle();
  },
  loaded() {
    this.viewModel = new SearchViewModel(this.map, this.$props);
    this.oldSearchTaskId = null;
    this.inputKeypressEvent();
  },
  computed: {
    getlength() {
      return this.searchResult.length > 0;
    }
  },
  updated() {
    this.changeSearchInputStyle();
    const results = this.$el.querySelectorAll('.sm-search__panel li');
    for(let result of results) {
      result.style.color = this.getTextColor;
    }
  },
  methods: {
    changeSearchInputStyle() {
      const serachInput = this.$el.querySelector('.el-input__inner');
      serachInput.style.backgroundColor = this.getBackground;
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
    clearResult() {
      this.$message.closeAll();
      this.searchResult = [];
      this.marker && this.marker.remove() && (this.marker = null);
      let icon = this.$el.querySelector('.el-input__icon');
      icon.classList.add('el-icon-search');
      icon.classList.remove('el-icon-loading');
    },
    searchButtonClicked() {
      this.search();
    },
    inputKeypressEvent() {
      const self = this;
      this.$el.querySelector('input').onkeypress = e => {
        if (e.which == 13) {
          !self.searchKey && self.search();
          self.$el.querySelector('input').onchange = () => {
            self.search();
          };
        }
      };
    },
    search() {
      this.clearResult();
      if (this.searchKey) {
        this.searchTaskId = this.viewModel.search(this.searchKey);
        this.regiterEvents();
        let icon = this.$el.querySelector('.el-input__icon');
        icon.classList.remove('el-icon-search');
        icon.classList.add('el-icon-loading');
      } else {
        this.$message({
          showClose: true,
          message: this.$t('search.noKey'),
          type: 'warning',
          duration: 1000
        });
      }
    },
    inputValueCleared() {
      this.clearResult();
    },
    searchResultListClicked(e) {
      let filter = e.target.innerHTML;
      this.marker && this.marker.remove();
      this.marker = null;
      this.linkageFeature(filter, e.target);
    },
    linkageFeature(filter, element) {
      let sourceTarget =
        element.parentElement.parentElement.previousElementSibling;
      let sourceName = sourceTarget.innerHTML;

      let popupData = this.viewModel.getFeatureInfo(
        this.searchResult,
        filter,
        sourceName
      );

      if (popupData.info.length >= 1) {
        let state = {
          columns: [
            {
              label: this.$t('search.attribute'),
              prop: 'attribute',
              width: 80
            },
            {
              label: this.$t('search.attributeValue'),
              prop: 'attributeValue',
              minWidth: 100
            }
          ],
          data: popupData.info
        };
        let popupContainer = new (Vue.extend(TablePopup))({
          propsData: { state }
        }).$mount();

        this.$nextTick(() => {
          this.marker = this.viewModel.addMarker(
            popupData.coordinates,
            popupContainer.$el
          );
        });
      }
    },
    regiterEvents() {
      this.searchKey >= 1 &&
        this.viewModel.off('searchsucceeded' + (this.searchTaskId - 1));
      this.viewModel.on('searchsucceeded' + this.searchTaskId, e => {
        this.searchResult = e.result;
        let icon = this.$el.querySelector('.el-input__icon');
        icon.classList.add('el-icon-search');
        icon.classList.remove('el-icon-loading');
        this.searchResult.length < 1 &&
          this.$message({
            showClose: true,
            message: this.$t('search.noResult'),
            type: 'warning',
            duration: 1000
          });
      });
    }
  }
};
</script>

