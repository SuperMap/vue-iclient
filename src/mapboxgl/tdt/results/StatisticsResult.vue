<template>
  <div v-if="data" class="statistics-results-container sm-component-tdtStatisticsResults">
    <div class="title">
      {{ $t('tdtResults.on') }}
      <span v-if="prompt" class="region">{{ prompt.name }}</span>
      {{ $t('tdtResults.cityHadResults') }}
    </div>
    <div class="content">
      <div class="priority-cities">
        <div
          v-for="(item, index) in priorityCitys"
          :key="index"
          class="city-item"
          @click="searchDetail(item)"
        >
          <a :style="getColorStyle(0)" href="javascript:void(0)">
            {{ item.name }}
            <span :style="getTextColorStyle">({{ item.count }})</span>
          </a>
        </div>
      </div>
      <div class="more-cities" @click="showMore = !showMore">
        <span>{{ $t('tdtResults.moreCity') }}</span>
        <a-icon :type="showMore ? 'caret-up' : 'caret-down'" />
      </div>
      <div v-show="showMore" class="cities-group">
        <div class="results">
          <a-tree
            showLine
            :treeData="data"
            :defaultExpandedKeys="['0-0-0']"
            :style="`--icon-color: ${getTextColor}`"
          >
            <template slot="title" slot-scope="{title, info}">
              <div class="city-item" @click="searchDetail(info)">
                <a :style="getColorStyle(0)" href="javascript:void(0)">
                  {{ title }}
                  <span :style="getTextColorStyle">({{ info.count }})</span>
                </a>
              </div>
            </template>
          </a-tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/Theme';

export default {
  name: 'StatisticsResult',
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
