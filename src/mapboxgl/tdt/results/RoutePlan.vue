<template>
  <sm-tabs
    v-model="activeTab"
    :class="['sm-component-tdtRoutePlan', 'route-plan', { 'route-bus-plan': searchType == 'bus' }]"
    :style="getTextColorStyle"
    type="card"
    size="small"
    @change="styleChanged"
  >
    <template v-for="(item, index) in tabMap[searchType]">
      <sm-tab-pane :key="index" :tab="item">
        <template v-if="routePlan && searchType === 'car'">
          <div class="distance">
            {{ $t('tdtResults.totalMiles') }}：{{ $t('tdtResults.distance', { distance: routePlan.distance }) }}
            <sm-checkbox class="show-all-info" @change="checkboxChanged">
              {{ $t('tdtResults.showDetails') }}
            </sm-checkbox>
          </div>
          <div class="start-position-title">
            <i class="icon" />
            <span :style="headingTextColorStyle">{{ start.name }}</span>
          </div>
          <div class="route-plan-container">
            <ul class="level-1">
              <template v-for="(route, idx) in routePlan.features.features.slice(1)">
                <li :key="idx" :class="{'car-info': true, 'detail-item': expandDetail[idx]}" @click="routePlanClicked($event, route.properties.id, index)">
                  <div>{{ `${idx + 1}、${route.properties.strguide.strguide}` }}</div>
                  <ul v-if="expandDetail[idx]" class="level-2">
                    <template v-for="(strguide, j) in route.properties.strguide.routeInfo">
                      <li :key="j">
                        <span :style="secondaryTextColorStyle">{{ strguide }}</span>
                      </li>
                    </template>
                  </ul>
                </li>
              </template>
            </ul>
          </div>
          <div class="dest-position-title">
            <i class="icon" />
            <span :style="headingTextColorStyle">{{ dest.name }}</span>
          </div>
        </template>
        <template v-if="routePlan && searchType === 'bus' && activeTab === index">
          <div class="start-position-title">
            <i class="icon" />
            <span :style="headingTextColorStyle">{{ start.name }}</span>
          </div>
          <div class="route-plan-container">
            <ul class="level-1">
              <template v-for="(route, idx) in routePlan">
                <li :key="idx" class="bus-info" @click="busInfoClicked($event, idx)">
                  <div class="line-header">
                    <div class="line-name">
                      <template v-for="(lineName, i) in route.lineNames">
                        <div :key="lineName.name">
                          <i :class="`${lineName.type} route-icon`" />
                          <span>{{ lineName.name }}</span>
                          <span v-if="i < route.lineNames.length - 1" class="right-direction">&gt;</span>
                        </div>
                      </template>
                    </div>
                    <div class="line-info" :style="secondaryTextColorStyle">
                      <span>
                        {{
                          `${
                            route.switchTimes
                              ? $t('tdtResults.switchTimes', { switchTimes: route.switchTimes })
                              : $t('tdtResults.noSwitch')
                          }`
                        }}
                      </span>
                      <span>{{ $t('tdtResults.distance', { distance: route.distance }) }}</span>
                      <span class="time">{{ route.time }}</span>
                    </div>
                  </div>
                  <div v-if="expandDetail[idx]" class="line-details">
                    <div class="start-label">
                      <div class="icon-holder">
                        <div class="icon" />
                      </div>
                      <span>{{ start.name }}</span>
                    </div>
                    <ul class="level-2">
                      <template v-for="(line, j) in route.features.features">
                        <li :key="j" @click="busPlanClicked($event, j, idx)">
                          <div class="icon-holder">
                            <i :class="[line.properties.type, 'route-icon']" />
                          </div>
                          <template v-if="!line.properties.lineName">
                            <span>
                              从{{ line.properties.stationStart.name || start.name }}{{ $t('tdtResults.walk') }}
                            </span>
                            <span>
                              <a href="javascript:void(0)">{{ line.properties.stationEnd.name || dest.name }}</a>
                            </span>
                          </template>
                          <template v-else>
                            <span>
                              {{ $t('tdtResults.take') }}{{ line.properties.lineName }}{{ $t('tdtResults.on') }}
                            </span>
                            <span>
                              <a href="javascript:void(0)">{{ line.properties.stationEnd.name }}</a>
                              {{
                                line.properties.segmentStationCount ? $t('tdtResults.getOff') : $t('tdtResults.getOn')
                              }}
                            </span>
                            <span v-if="line.properties.segmentStationCount" class="station-count" :style="disabledTextColorStyle">
                              {{ line.properties.segmentStationCount }}{{ $t('tdtResults.station') }}
                            </span>
                          </template>
                        </li>
                      </template>
                    </ul>
                    <div class="dest-label">
                      <div class="icon-holder">
                        <div class="icon" />
                      </div>
                      <span>{{ dest.name }}</span>
                    </div>
                  </div>
                </li>
              </template>
            </ul>
          </div>
          <div class="dest-position-title">
            <i class="icon" />
            <span :style="headingTextColorStyle">{{ dest.name }}</span>
          </div>
        </template>
        <div v-if="!routePlan" class="loading-and-tip-holder">
          <sm-spin :spinning="spinning" />
          <sm-empty v-if="isError && !spinning" :description="$t('tdtResults.noSearchResults')" />
        </div>
      </sm-tab-pane>
    </template>
  </sm-tabs>
</template>
<script>
import SmTabs from '../../../common/tabs/Tabs';
import SmTabPane from '../../../common/tabs/TabPane';
import SmSpin from '../../../common/spin/Spin';
import SmCheckbox from '../../../common/checkbox/Checkbox';
import SmEmpty from '../../../common/empty/Empty';
import Theme from '../../../common/_mixin/Theme';

export default {
  name: 'RoutePlan',
  components: {
    SmTabs,
    SmTabPane,
    SmSpin,
    SmCheckbox,
    SmEmpty
  },
  mixins: [Theme],
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
        if (this.activeTab >= this.tabMap[this.searchType].length) {
          this.activeTab = 0;
        }
      }
    }
  },
  methods: {
    styleChanged(val) {
      this.expandDetail = [true];
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
<style lang="scss"></style>
