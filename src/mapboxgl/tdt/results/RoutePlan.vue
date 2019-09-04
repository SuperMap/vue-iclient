<template>
  <a-tabs
    v-model="activeTab"
    :class="['route-plan', {'route-bus-plan': searchType == 'bus'}]"
    type="card"
    size="small"
    @change="styleChanged"
  >
    <template v-for="(item,index) in tabMap[searchType]">
      <a-tab-pane :key="index" :tab="item">
        <template v-if="routePlan && searchType==='car'">
          <div class="distance">总里程：约{{ routePlan.distance }}公里</div>
          <div class="route-plan-container">
            <div class="start-label">
              <div class="icon"></div>
              <span class="name" :title="start.name">{{ start.name }}</span>
              <a-checkbox class="show-all-info" @change="checkboxChanged">显示全部详情</a-checkbox>
            </div>
            <ul class="level-1">
              <template v-for="(route,idx) in (routePlan.features.features.slice(1))">
                <li :key="idx" @click="routePlanClicked($event, route.properties.id, index)">
                  <span>{{ idx+1 }}.</span>
                  <span>{{ route.properties.strguide.strguide }}</span>
                  <ul v-if="expandDetail[idx]" class="level-2">
                    <template v-for="(strguide,j) in route.properties.strguide.routeInfo">
                      <li :key="j">
                        <span>{{ j+1 }})</span>
                        <span>{{ strguide }}</span>
                      </li>
                    </template>
                  </ul>
                </li>
              </template>
            </ul>
            <div class="dest-label">
              <div class="icon"></div>
              <span>{{ dest.name }}</span>
            </div>
          </div>
        </template>
        <template v-if="routePlan && searchType==='bus' && activeTab === index">
          <div class="route-plan-container">
            <ul class="level-1">
              <template v-for="(route, idx) in routePlan">
                <li
                  :key="idx"
                  :class="['bus-info', { expand: expandDetail[idx] }]"
                  @click="busInfoClicked($event, idx)"
                >
                  <div class="line-header">
                    <div class="line-name">
                      <template v-for="(lineName, i) in route.lineNames">
                        <div :key="lineName.name">
                          <i :class="`${lineName.type} route-icon`"></i>
                          <span>{{ lineName.name }}</span>
                          <span v-if="i < route.lineNames.length - 1" class="right-direction">></span>
                        </div>
                      </template>
                    </div>
                    <div class="line-info">
                      <span>{{ `${route.switchTimes ? `换乘${route.switchTimes}次` : '无换乘'}` }}</span>
                      <span>/约{{ route.distance }}公里</span>
                      <span class="time">{{ route.time }}</span>
                    </div>
                  </div>
                  <div v-if="expandDetail[idx]" class="line-details">
                    <div class="start-label">
                      <div class="icon"></div>
                      <span>{{ start.name }}</span>
                    </div>
                    <i class="route-point route-icon"></i>
                    <ul class="level-2">
                      <template v-for="(line, j) in route.features.features">
                        <li :key="j" @click="busPlanClicked($event, j, idx)">
                          <i :class="[line.properties.type,'route-icon']"></i>
                          <template v-if="!line.properties.lineName">
                            <span>从{{ line.properties.stationStart.name||start.name }}步行至</span>
                            <span>
                              <a
                                href="javascript:void(0)"
                              >{{ line.properties.stationEnd.name||dest.name }}</a>
                            </span>
                          </template>
                          <template v-else>
                            <span>乘坐{{ line.properties.lineName }}在</span>
                            <span>
                              <a href="javascript:void(0)">{{ line.properties.stationEnd.name }}</a>
                              下车
                            </span>
                            <span class="time">{{ line.properties.segmentStationCount }}站</span>
                          </template>
                          <i class="route-point route-icon"></i>
                        </li>
                      </template>
                    </ul>
                    <div class="dest-label">
                      <div class="icon"></div>
                      <span>{{ dest.name }}</span>
                    </div>
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </template>
        <div v-if="!routePlan" style="text-align:center">
          <a-spin :spinning="spinning" size="large"></a-spin>
          <div v-if="isError">没有查询到线路信息</div>
        </div>
      </a-tab-pane>
    </template>
  </a-tabs>
</template>
<script>
export default {
  name: 'RoutePlan',
  props: {
    routePlan: { type: [Object, Array] },
    start: { type: Object },
    dest: { type: Object },
    spinning: { type: Boolean },
    searchType: {
      type: String,
      default: 'car'
    },
    isError: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: 0,
      tabMap: {
        car: ['最快线路', '最短线路', '少走高速'],
        bus: ['较快捷', '不做地铁', '少换乘', '少步行']
      },
      expandDetail: []
    };
  },
  watch: {
    searchType: {
      immediate: true,
      handler() {
        this.searchType === 'bus' && (this.expandDetail = [true]);
      }
    }
  },
  methods: {
    styleChanged(val) {
      this.expandDetail = val === 'car' ? [] : [true];
      this.$emit('style-changed', val);
    },
    routePlanClicked(e, index, parentIndex) {
      const expand = !this.expandDetail[index - 1];
      this.$set(this.expandDetail, index - 1, expand);
      this.$emit('route-plan-clicked', expand && index, parentIndex);
    },
    checkboxChanged(e) {
      const { features = [] } = this.routePlan.features;
      const arr = new Array(features.slice(1).length);
      this.expandDetail = e.target.checked ? arr.fill(true) : arr.fill(false);
    },
    busInfoClicked(e, idx) {
      const expandDetail = this.expandDetail.slice();
      expandDetail[idx] = !expandDetail[idx];
      this.expandDetail = expandDetail.map((item, index) => {
        return index === idx ? item : false;
      });
      this.$emit('bus-info-clicked', idx, expandDetail[idx]);
    },
    busPlanClicked(e, index, parentIndex) {
      e.stopPropagation();
      this.$emit('route-plan-clicked', index, parentIndex);
    }
  }
};
</script>
<style lang='scss'>
.route-plan-popup {
  background: #fff;
  min-width: 371px;
  z-index: 5;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
  color: rgb(0, 0, 0);
  .tdt_popup_content {
    padding: 20px 20px 0 20px;
  }
  .info_container {
    p {
      font-size: 12px;
      margin-top: 10px;
    }
    cursor: default;
    word-wrap: break-word;
    width: 330px;
    .title {
      font-weight: 700;
      font-size: 14px;
      border-bottom: 1px solid #ccc;
      padding: 5px 0;
      span {
        display: inline-block;
        width: 240px;
        height: 20px;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
}
.route-plan {
  font-size: 12px;
  padding: 0 18.5px;
  color: rgb(0, 0, 0);
  .route-icon {
    width: 16px;
    height: 16px;
    background: url('../../../../static/images/sprite.png');
    background-repeat: no-repeat;
    display: inline-block;
    margin-top: 4px;
    margin-right: 5px;
  }
  .icon {
    display: inline-block;
    vertical-align: middle;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    background: #fff;
    border: 2px solid;
    margin-right: 2px;
    margin-top: -4px;
  }
  &.route-bus-plan {
    .ant-tabs-tab {
      width: 25% !important;
    }
  }
  &.ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    padding: 0;
    width: 33%;
    text-align: center;
    margin-right: 0;
    line-height: 26px;
    font-size: 12px;
    border-bottom: 1px solid #e8e8e8;
    border-right-color: transparent;
    border-radius: 0;
    &:last-child {
      border-right-color: #e8e8e8;
    }
    &.ant-tabs-tab-active {
      background: #f0f7ff;
    }
  }
  &.ant-tabs .ant-tabs-small-bar .ant-tabs-tab {
    padding: 0;
  }
  .ant-tabs-nav {
    width: 100%;
  }
  .ant-tabs-bar {
    margin: 20px 0;
    border-bottom: none;
  }
  &.ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-nav-container {
    height: 28px;
  }
  .distance {
    text-align: left;
    background: #f0f7ff;
    padding: 10px;
  }
  .start-label,
  .dest-label {
    padding: 10px;
  }
  .start-label {
    overflow: hidden;
    .icon {
      border-color: rgb(50, 188, 95);
      vertical-align: unset;
    }
    .name {
      display: inline-block;
      max-width: 130px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    border-color: rgb(50, 188, 95);
    width: 100%;
    line-height: 16px;
  }
  .show-all-info {
    float: right;
    color: rgb(0, 0, 0);
  }
  .ant-checkbox-wrapper {
    font-size: 12px;
    & + span {
      padding-right: 0;
    }
  }
  li,
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    line-height: 22px;
  }
  .line-details {
    position: relative;
    & > .route-point {
      left: 15px;
      margin-top: 6px;
    }
    .level-2 {
      margin-top: 6px;
    }
    .start-label,
    .dest-label {
      .icon {
        vertical-align: middle;
        margin-right: 5px;
      }
    }
  }
  .route-point {
    position: absolute;
    left: 3px;
    top: 24px;
    width: 4px;
    height: 12px;
    background-repeat: no-repeat;
    background-position: -335px -188px;
  }
  .walk {
    margin-left: 2px;
    margin-right: 5px;
    width: 9px;
    height: 16px;
    background-position: -242px -184px;
  }
  .bus {
    width: 14px;
    height: 16px;
    background-position: -148px -183px;
  }
  .metro {
    width: 12px;
    height: 16px;
    background-position: -220px -184px;
  }
  .line-info {
    span {
      color: #999;
    }
  }
  .line-name {
    & > div {
      display: inline-block;
      height: 24px;
      line-height: 24px;
      span {
        display: inline-block;
        vertical-align: top;
      }
    }
  }
  .right-direction {
    margin-right: 8px;
    font-weight: 700;
  }
  span.time {
    float: right;
    margin-right: 10px;
    color: #999;
  }
  .level-1 {
    & > li {
      &.expand {
        .line-header {
          background: #f0f7ff;
        }
      }
      .line-header {
        cursor: pointer;
        padding-left: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
      }
      &:not(.expand):hover {
        background: #f2f2f2;
      }
      padding: 15px 10px;
      border-top: 1px solid #e5e5e5;
      cursor: pointer;
      & > span:nth-child(1) {
        color: #2f87eb;
      }
      &.bus-info {
        .level-2 {
          li {
            height: 44px;
            span {
              display: inline-block;
              vertical-align: top;
            }
          }
        }
      }
    }
  }
  .level-2 {
    margin-left: 10px;
    li {
      position: relative;
      cursor: pointer;
      a {
        text-decoration: none;
        color: #2f87eb;
      }
    }
    .route-icon {
      margin-right: 10px;
      margin-left: 1px;
    }
  }

  .dest-label {
    .icon {
      border-color: rgb(250, 89, 106);
    }
  }
  .route-plan-container {
    overflow: scroll;
    max-height: 480px;
    overflow-x: hidden;
  }
}
</style>
