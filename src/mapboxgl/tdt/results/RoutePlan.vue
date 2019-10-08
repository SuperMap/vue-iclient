<template>
  <a-tabs
    v-model="activeTab"
    :class="['sm-component-tdtRoutePlan', 'route-plan', {'route-bus-plan': searchType == 'bus'}]"
    :style="themeStyle"
    type="card"
    size="small"
    @change="styleChanged"
  >
    <template v-for="(item,index) in tabMap[searchType]">
      <a-tab-pane :key="index" :tab="item">
        <template v-if="routePlan && searchType==='car'">
          <div
            class="distance"
          >{{ $t('tdtResults.totalMiles') }}：{{ $t('tdtResults.distance', {'distance': routePlan.distance}) }}</div>
          <div class="route-plan-container">
            <div class="start-label">
              <div class="icon"></div>
              <span class="name" :title="start.name">{{ start.name }}</span>
              <a-checkbox
                class="show-all-info"
                :style="themeStyle"
                @change="checkboxChanged"
              >{{ $t('tdtResults.showDetails') }}</a-checkbox>
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
                <li :key="idx" :class="['bus-info']" @click="busInfoClicked($event, idx)">
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
                      <span>{{ `${route.switchTimes ? $t('tdtResults.switchTimes', {'switchTimes': route.switchTimes}) : $t('tdtResults.noSwitch')}` }}</span>
                      <span>/{{ $t('tdtResults.distance', {'distance': route.distance}) }}</span>
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
                            <span>从{{ line.properties.stationStart.name||start.name }}{{ $t('tdtResults.walk') }}</span>
                            <span>
                              <a
                                href="javascript:void(0)"
                              >{{ line.properties.stationEnd.name||dest.name }}</a>
                            </span>
                          </template>
                          <template v-else>
                            <span>{{ $t('tdtResults.take') }}{{ line.properties.lineName }}{{ $t('tdtResults.on') }}</span>
                            <span>
                              <a href="javascript:void(0)">{{ line.properties.stationEnd.name }}</a>
                              {{ line.properties.segmentStationCount ? $t('tdtResults.getOff'):$t('tdtResults.getOn') }}
                            </span>
                            <span
                              v-if="line.properties.segmentStationCount"
                              class="time"
                            >{{ line.properties.segmentStationCount }}{{ $t('tdtResults.station') }}</span>
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
          <div v-if="isError">{{ $t('tdtResults.noSearchResults') }}</div>
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
    },
    themeStyle: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      activeTab: 0,
      tabMap: {
        car: [this.$t('tdtResults.fastRoute'), this.$t('tdtResults.shortRoute'), this.$t('tdtResults.walkRoute')],
        bus: [
          this.$t('tdtResults.fast'),
          this.$t('tdtResults.noSubway'),
          this.$t('tdtResults.lessSwitch'),
          this.$t('tdtResults.lessWalk')
        ]
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
    },
    textColorsData: {
      handler() {
        this.changeSearchInputStyle();
      }
    }
  },
  methods: {
    changeSearchInputStyle() {
      const serachInput = this.$el.querySelectorAll('.show-all-info');
      serachInput.forEach(item => {
        item.style.color = this.getTextColor;
      });
    },
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
</style>
