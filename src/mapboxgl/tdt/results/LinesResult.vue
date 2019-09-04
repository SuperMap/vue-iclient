<template>
  <div v-if="data" class="linedata-results-container">
    <a class="link-to-points" :style="getColorStyle(0)" @click="searchPointsResult">点击此处查看 "{{ keyWord }}" 的相关地点</a>
    <div class="title">
      共为您找到
      <span class="total-num">{{ count }}</span>
      条公交线路
    </div>
    <div v-if="data" class="content">
      <ul class="line-groups">
        <li
          v-for="(line, groupIndex) in data"
          :key="line.uuid"
          class="line-item"
          :style="detailVisibles[groupIndex] && getBackgroundStyle"
          @mouseenter="e => e.target.style.background = getBackground"
          @mouseleave="e => e.target.style.background = detailVisibles[groupIndex] ? getBackground : 'inherit'"
        >
          <i class="line-icon" />
          <div class="line-info">
            <p class="name" :title="line.name" :style="getColorStyle(0)">{{ line.name }}</p>
            <p class="count">
              共
              <span :style="getColorStyle(0)">{{ line.stationNum }}</span>
              站
            </p>
            <p class="show-details" @click="showLineDetail(line.uuid, groupIndex)">
              <span>展开详情</span>
              <a-icon :type="detailVisibles[groupIndex] ? 'caret-up' : 'caret-down'" />
            </p>
            <div v-if="detailVisibles[groupIndex] && busData[line.uuid]" class="detail-info">
              <p class="time">
                首末车事件：
                <span :style="getColorStyle(0)">{{ (busData[line.uuid] || {}).starttime }} - {{ (busData[line.uuid] || {}).endtime }}</span>
              </p>
              <ul class="lines" :style="getBackgroundStyle">
                <li
                  v-for="(bus, index) in ((busData[line.uuid] || {}).station || [])"
                  :key="bus.uuid"
                  @click="generatePopup(bus)"
                  @mouseenter="e => e.target.style.color = getColor(0)"
                  @mouseleave="e => e.target.style.color = 'inherit'"
                >{{ `${index + 1}、${bus.name}` }}</li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Theme from '../../../common/_mixin/theme';

export default {
  name: 'LinedataResult',
  mixins: [Theme],
  inheritAttrs: false,
  props: {
    keyWord: {
      type: String
    },
    count: {
      type: Number,
      default: 0
    },
    data: {
      type: Array
    },
    busData: {
      type: Object,
      default() {
        return {};
      }
    },
    prompt: {
      type: Object
    }
  },
  data() {
    return {
      detailVisibles: [true]
    };
  },
  methods: {
    generatePopup(pointInfo) {
      let coordinate = pointInfo.lonlat.split(',');
      this.$emit('show-point-popup', { coordinates: [+coordinate[0], +coordinate[1]], data: pointInfo, from: 'LineString' });
    },
    searchPointsResult() {
      const params = {
        queryType: '7',
        queryTerminal: 10000,
        specifyAdminCode: this.prompt.adminCode
      };
      this.$emit('search-points-result', this.keyWord, params, true);
    },
    showLineDetail(uuid, groupIndex) {
      const detailVisibles = new Array(this.data.length).fill(false);
      detailVisibles[groupIndex] = !this.detailVisibles[groupIndex];
      this.detailVisibles = detailVisibles;
      detailVisibles[groupIndex] ? this.$emit('show-line-detail', uuid) : this.$emit('reset-line-source');
    }
  }
};
</script>

<style lang="scss" scoped>
.linedata-results-container {
  .link-to-points {
    display: block;
    font-weight: 700;
    text-decoration: underline;
    line-height: 36px;
    padding: 0 20px;
  }
  .title {
    height: 30px;
    line-height: 30px;
  }
  .content {
    .line-groups {
      padding: 0 20px;
      .line-item {
        margin-bottom: 10px;
        .line-icon,
        .line-info {
          display: inline-block;
          vertical-align: top;
        }
        .line-icon {
          background: url('../../../../static/images/sprite.png') no-repeat -148px -183px;
          width: 14px;
          height: 16px;
          margin-top: 5px;
        }
        .line-info {
          margin-left: 10px;
          p {
            padding: 3px 2px;
            margin: 0;
            &.name {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              max-width: 200px;
            }
            &.count {
              span {
                font-weight: 700;
              }
            }
            &.show-details {
              cursor: pointer;
            }
          }
          .detail-info {
            .time {
              span {
                font-weight: 700;
              }
            }
            .lines {
              margin: 5px 0;
              padding: 0;
              li {
                padding: 4px 20px;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }
}
</style>
