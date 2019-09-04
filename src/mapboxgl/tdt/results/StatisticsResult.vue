<template>
  <div v-if="data" class="statistics-results-container">
    <div class="title">
      在
      <span v-if="prompt" class="region">{{ prompt.name }}</span>
      以下城市有结果，请您选择
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
        <span>更多城市</span>
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
import Theme from '../../../common/_mixin/theme';

export default {
  name: 'StatisticsResult',
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
        console.log(this.$parent.$parent.map);
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

<style lang="scss">
.statistics-results-container {
  padding-bottom: 10px;
  .content {
    .ant-tree {
      &.ant-tree-show-line {
        ul {
          list-style: none;
        }
        li {
          &:not(:last-child):before {
            border-left-color: transparent;
          }
          .ant-tree-switcher {
            background: transparent;
          }
          .ant-tree-node-content-wrapper {
            &:hover {
              background: transparent;
            }
          }
        }
        .ant-tree-switcher-line-icon {
          color: var(--icon-color);
        }
      }
    }
    .city-item {
      a {
        white-space: nowrap;
        &:link,
        &:visited,
        &:hover,
        &:active {
          text-decoration: none;
        }
      }
    }
    .priority-cities {
      overflow: hidden;
      .city-item {
        float: left;
        padding: 6px 20px;
        width: 106px;
        box-sizing: content-box;
      }
    }

    .more-cities {
      padding: 5px 20px;
      cursor: pointer;
      i {
        margin-left: 2px;
      }
    }

    .cities-group {
      width: 95%;
      margin: 0 auto;
      .results {
        padding: 0 20px;
        ul {
          li {
            font-size: 12px;
            padding-top: 0;
            padding-bottom: 0;
          }
          .ant-tree-node-content-wrapper.ant-tree-node-selected {
            background-color: transparent;
          }
        }
      }
    }
  }
}
</style>
