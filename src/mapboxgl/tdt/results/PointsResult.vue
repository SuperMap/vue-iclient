<template>
  <div v-if="data" class="points-result-container">
    <div v-if="from==='Search'" class="title">
      在
      <span v-if="prompt" class="region">{{ prompt.name || '' }}</span>
      共找到
      <span class="total-num">{{ count }}</span>
      条结果
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
          <span class="name" :title="item.name" :style="getColorStyle(0)">{{ item.name }}</span>
          <span v-if="item.phone" class="phone">电话：{{ item.phone }}</span>
          <span class="address" :title="item.address">地址：{{ item.address }}</span>
        </div>
        <div
          v-if="from === 'Route' && resultBelongTo === 'start'"
          class="set-start-point"
          :style="getColorStyle(0)"
          @click="resetStartPoint(item)"
        >设为起点</div>
        <div
          v-if="from === 'Route' && resultBelongTo === 'end'"
          class="set-start-point"
          :style="getColorStyle(0)"
          @click="resetEndPoint(item)"
        >设为终点</div>
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
import Theme from '../../../common/_mixin/theme';
import Pagination from './Pagination';

export default {
  name: 'RouteResult',
  components: {
    Pagination
  },
  mixins: [Theme],
  inheritAttrs: false,
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
      type: Boolean,
      default: false
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
        target.style.background = this.getBackground;
        resetPointDom && (resetPointDom.style.display = 'block');
        buoy && buoy.classList.add('buoy-icon-active');
        this.setHighlightIcon(info.hotPointID);
      } else {
        target.style.background = 'inherit';
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
        count: `${pageSize}`
      };
      if (this.openPurePoiSearch) {
        params.queryType = '7';
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

<style lang="scss" scoped>
.points-result-container {
  .buoy-icon {
    background-image: url('../../../../static/images/sprite.png');
    background-repeat: no-repeat;
    width: 26px;
    height: 30px;
    display: inline-block;
    vertical-align: top;
    cursor: pointer;
    &.buoy-icon-active {
      &.buoy-icon-1 {
        background-position: -316px -77px;
      }
      &.buoy-icon-2 {
        background-position: -346px -77px;
      }
      &.buoy-icon-3 {
        background-position: -376px -77px;
      }
      &.buoy-icon-4 {
        background-position: -406px -77px;
      }
      &.buoy-icon-5 {
        background-position: -436px -77px;
      }
      &.buoy-icon-6 {
        background-position: -466px -77px;
      }
      &.buoy-icon-7 {
        background-position: -496px -77px;
      }
      &.buoy-icon-8 {
        background-position: -526px -77px;
      }
      &.buoy-icon-9 {
        background-position: -556px -77px;
      }
      &.buoy-icon-10 {
        background-position: -586px -77px;
      }
    }
    &.buoy-icon-1 {
      background-position: -318px -117px;
    }
    &.buoy-icon-2 {
      background-position: -348px -117px;
    }
    &.buoy-icon-3 {
      background-position: -378px -117px;
    }
    &.buoy-icon-4 {
      background-position: -408px -117px;
    }
    &.buoy-icon-5 {
      background-position: -438px -117px;
    }
    &.buoy-icon-6 {
      background-position: -468px -117px;
    }
    &.buoy-icon-7 {
      background-position: -498px -117px;
    }
    &.buoy-icon-8 {
      background-position: -528px -117px;
    }
    &.buoy-icon-9 {
      background-position: -558px -117px;
    }
    &.buoy-icon-10 {
      background-position: -588px -117px;
    }
  }

  ul {
    margin: 0;
    padding: 0;
    overflow: hidden;
    li {
      list-style: none;
      padding: 12px 0 12px 53px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      .buoy-icon {
        position: absolute;
        left: 22px;
        top: 15px;
      }
      .route-info {
        width: 72%;
        float: left;
        span {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          line-height: 24px;
        }
      }
      .set-start-point {
        display: none;
        line-height: 24px;
        float: right;
        padding-right: 4px;
      }
    }
  }
}
</style>
