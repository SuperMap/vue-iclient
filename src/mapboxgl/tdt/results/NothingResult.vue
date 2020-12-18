<template>
  <div v-if="data" class="search-results-container nothing-results-container sm-component-tdtNoResults">
    <div class="title">
      {{ $t('tdtResults.on') }}
      <span v-if="prompt" class="region">{{ prompt.name }}</span>
      {{ $t('tdtResults.searchNoResult') }}
    </div>
    <div class="content">
      <div class="data-content">
        <div v-if="!noResultInfo.DidYouMean" class="try-content">
          <p class="label">{{ $t('tdtResults.youCanTry') }}：</p>
          <div class="data-list">
            <p>1、{{ $t('tdtResults.enterCorrect') }}</p>
            <p>2、{{ $t('tdtResults.enterOtherKeyWords') }}</p>
            <p>
              3、{{ $t('tdtResults.onTdtMap') }}
              <a
                href="https://www.tianditu.gov.cn/feedback/#/newPlace"
                target="_bank"
              >
                {{ $t('tdtResults.addThisAddress') }}
              </a>
            </p>
          </div>
        </div>
        <div v-if="noResultInfo.DidYouMean" class="didyoumean-content">
          <p>
            {{ $t('tdtResults.uWantTo') }}：
            <a
              href="javascript:void(0)"
              @click="searchResult"
            >
              {{ noResultInfo.DidYouMean }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/Theme';

export default {
  name: 'NothingResult',
  mixins: [Theme],
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
    this.noResultInfo = this.data.find(item => +item.type === 2) || {};
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
