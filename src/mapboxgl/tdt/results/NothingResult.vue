<template>
  <div v-if="data" class="search-results-container nothing-results-container">
    <div class="title">
      在
      <span v-if="prompt" class="region">{{ prompt.name }}</span>
      没有查询到相关结果
    </div>
    <div class="content">
      <div class="data-content">
        <div v-if="!noResultInfo.DidYouMean" class="try-content">
          <p class="label">您可以尝试：</p>
          <div class="data-list">
            <p>1、检查输入是否正确</p>
            <p>2、输入其他关键字进行搜索</p>
            <p>
              3、在天地图上
              <a
                href="http://www.tianditu.gov.cn/feedback/#/newPlace"
                target="_bank"
                :style="getColorStyle(0)"
              >添加该地点</a>
            </p>
          </div>
        </div>
        <div v-if="noResultInfo.DidYouMean" class="didyoumean-content">
          <p>
            您是否要找：
            <a
              href="javascript:void(0)"
              :style="getColorStyle(0)"
              @click="searchResult"
            >{{ noResultInfo.DidYouMean }}</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/theme';

export default {
  name: 'NothingResult',
  mixins: [Theme],
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    prompt: {
      type: Object
    },
    from: {
      type: String,
      default: 'Search' // Search   Route
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      noResultInfo: {},
      region: {}
    };
  },
  mounted() {
    this.noResultInfo = this.data.find(item => +item.type === 2);
  },
  methods: {
    searchResult() {
      const params = {
        queryType: '1',
        queryTerminal: 10000,
        specifyAdminCode: this.prompt.adminCode
      };
      if (this.from === 'Route') {
        params.queryType = '7';
        params.count = this.pageSize;
        this.$emit('search-points-result', this.keyWord, params, true);
        return;
      }
      this.$emit('search-points-result', this.keyWord, params, false);
    }
  }
};
</script>

<style lang="scss" scoped>
.nothing-results-container {
  .data-content {
    padding: 10px 20px;

    .data-list {
      a {
        font-weight: 700;
        text-decoration: underline;
      }
    }
  }

  .didyoumean-content {
    a {
      font-weight: 700;
      text-decoration: underline;
    }
  }
}
</style>
