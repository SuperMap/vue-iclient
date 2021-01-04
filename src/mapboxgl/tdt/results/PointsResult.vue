<template>
  <div v-if="data" class="sm-component-tdtPointsResults points-result-container">
    <div v-if="from==='Search'" class="title">
      {{ $t('tdtResults.on') }}
      <span v-if="prompt" class="region">{{ prompt.name || '' }}</span>
      {{ $t('tdtResults.totalFind') }}
      <span class="total-num">{{ count }}</span>
      {{ $t('tdtResults.piecesResults') }}
    </div>
    <ul>
      <li
        v-for="(item, index) in data"
        :key="index"
        @click="addPointToMap(item, index)"
        @mouseenter="toggleBuoyActive($event, item)"
        @mouseleave="toggleBuoyActive($event)"
      >
        <div :class="`buoy-icon buoy-icon-${index + 1}`"></div>
        <div class="route-info">
          <span class="name" :title="item.name" :style="headingTextColorStyle">{{ item.name }}</span>
          <span v-if="item.phone" class="phone" :style="secondaryTextColorStyle">{{ $t('tdtResults.phone') }}：{{ item.phone }}</span>
          <span
            class="address"
            :title="item.address"
            :style="secondaryTextColorStyle"
          >{{ $t('tdtResults.address') }}：{{ item.address }}</span>
        </div>
        <div
          v-if="from === 'Route' && resultBelongTo === 'start'"
          class="set-start-point"
          :title="$t('tdtResults.setStartPonint')"
          @click="resetStartPoint(item)"
        >{{ $t('tdtResults.setStartPonint') }}</div>
        <div
          v-if="from === 'Route' && resultBelongTo === 'end'"
          class="set-start-point"
          :title="$t('tdtResults.setEndPonint')"
          @click="resetEndPoint(item)"
        >{{ $t('tdtResults.setEndPonint') }}</div>
      </li>
    </ul>
    <Pagination
      :total="count"
      :pageNo="pageNo"
      :pageSize="pageSize"
      :hide-on-single-page="true"
      @change="pagiantionChange"
    />
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/Theme';
import Pagination from './Pagination';

export default {
  name: 'RouteResult',
  components: {
    Pagination
  },
  mixins: [Theme],
  props: {
    keyWord: {
      type: String
    },
    from: {
      type: String,
      default: 'Search' // Search   Route
    },
    resultBelongTo: {
      type: String
    },
    data: {
      type: Array
    },
    count: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 10
    },
    prompt: {
      type: Object
    },
    openPurePoiSearch: {
      // 是否开启纯POI搜索
      type: Boolean,
      default: false
    },
    specifyAdminSearch: {
      // 是否指定行政区查询
      type: Boolean,
      default: false
    },
    mapBound: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pageNo: 1
    };
  },
  methods: {
    resetStartPoint(data) {
      this.$emit('reset-start-point', data);
    },
    resetEndPoint(data) {
      this.$emit('reset-end-point', data);
    },
    addPointToMap(info, index) {
      if (this.from === 'Search') {
        let center = info.lonlat.split(' ');
        this.$emit('show-point-popup', { coordinates: [+center[0], +center[1]], data: info });
      }
    },
    toggleBuoyActive(e, info) {
      const { type, target } = e;
      const parent = target;
      const buoy = parent.querySelector('.buoy-icon');
      const resetPointDom = parent.querySelector('.set-start-point');
      if (type === 'mouseenter') {
        resetPointDom && (resetPointDom.style.display = 'block');
        buoy && buoy.classList.add('buoy-icon-active');
        this.setHighlightIcon(info.hotPointID);
      } else {
        resetPointDom && (resetPointDom.style.display = 'none');
        buoy && buoy.classList.remove('buoy-icon-active');
        this.setHighlightIcon();
      }
    },
    setHighlightIcon(hotPointID) {
      this.$emit('set-highlight-icon', hotPointID || '');
    },
    searchPointsResult(page, pageSize) {
      const params = {
        queryType: '1',
        queryTerminal: 10000,
        start: `${(page - 1) * pageSize}`,
        count: `${pageSize}`,
        mapBound: this.mapBound
      };
      if (this.openPurePoiSearch) {
        params.queryType = '7';
      }
      if (this.specifyAdminSearch) {
        params.specifyAdminCode = this.prompt.adminCode;
      }
      this.$emit('change-pagination', this.keyWord, params, this.openPurePoiSearch);
    },
    pagiantionChange({ page, pageSize }) {
      this.pageNo = page;
      this.searchPointsResult(page, pageSize);
    }
  }
};
</script>
