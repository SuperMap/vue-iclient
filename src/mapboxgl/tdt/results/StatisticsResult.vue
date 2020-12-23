<template>
  <div v-if="data" class="statistics-results-container sm-component-tdtStatisticsResults">
    <div :class="{ title: true, 'without-split-line': !priorityCitys || !priorityCitys.length }">
      {{ $t('tdtResults.on') }}
      <span v-if="prompt" class="region">{{ prompt.name }}</span>
      {{ $t('tdtResults.cityHadResults') }}
    </div>
    <div class="content">
      <div v-if="priorityCitys && priorityCitys.length > 0" class="priority-cities">
        <div v-for="(item, index) in priorityCitys" :key="index" class="city-item add-ellipsis" @click="searchDetail(item)">
          <a href="javascript:void(0)">
            {{ item.name }}
            <span>({{ item.count }})</span>
          </a>
        </div>
      </div>
      <div class="more-cities" @click="showMore = !showMore">
        <span>{{ $t('tdtResults.moreCity') }}</span>
        <i :class="showMore ? 'sm-components-icon-solid-triangle-up' : 'sm-components-icon-solid-triangle-down'" />
      </div>
      <div v-show="showMore" class="cities-group">
        <div class="results">
          <sm-tree showLine :treeData="data" :defaultExpandedKeys="['0-0-0']" :style="getTextColorStyle">
            <template slot="title" slot-scope="{ title, info }">
              <div class="city-item add-ellipsis" @click="searchDetail(info)">
                <a href="javascript:void(0)">
                  {{ title }}
                  <span>（{{ info.count }}）</span>
                </a>
              </div>
            </template>
          </sm-tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/Theme';
import SmTree from '../../../common/tree/Tree';

export default {
  name: 'StatisticsResult',
  components: {
    SmTree
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
    pageSize: {
      type: Number,
      default: 10
    },
    priorityCitys: {
      type: Array
    },
    data: {
      type: Array
    },
    prompt: {
      type: Object
    }
  },
  data() {
    return {
      showMore: true
    };
  },
  methods: {
    searchPointsResult(adminCode) {
      const params = {
        queryType: '1',
        queryTerminal: 10000,
        specifyAdminCode: adminCode
      };
      if (this.from === 'Route') {
        params.queryType = '7';
        params.count = this.pageSize;
        this.$emit('search-points-result', this.keyWord, params, true);
        return;
      }
      this.$emit('search-points-result', this.keyWord, params, false);
    },
    searchDetail(info) {
      if (info.lon && info.lat && !info.childAdmins) {
        const center = [+info.lon, +info.lat];
        const map = this.$parent.map || this.$parent.$parent.map;
        map.easeTo({
          center
        });

        this.searchPointsResult(info.adminCode);
      }
    }
  }
};
</script>
