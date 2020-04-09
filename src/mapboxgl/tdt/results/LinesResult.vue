<template>
  <div v-if="data" class="linedata-results-container sm-component-tdtLineResults">
    <a
      class="link-to-points"
      :style="getColorStyle(0)"
      @click="searchPointsResult"
    >{{ $t('tdtResults.relateAdress', {keyWord: keyWord}) }}</a>
    <div class="title">
      {{ $t('tdtResults.allFound') }}
      <span class="total-num">{{ count }}</span>
      {{ $t('tdtResults.piecesBusRoute') }}
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
              {{ $t('tdtResults.total') }}
              <span :style="getColorStyle(0)">{{ line.stationNum }}</span>
              {{ $t('tdtResults.station') }}
            </p>
            <p class="show-details" @click="showLineDetail(line.uuid, groupIndex)">
              <span>{{ $t('tdtResults.showDetail') }}</span>
              <a-icon :type="detailVisibles[groupIndex] ? 'caret-up' : 'caret-down'" />
            </p>
            <div v-if="detailVisibles[groupIndex] && busData[line.uuid]" class="detail-info">
              <p class="time">
                {{ $t('tdtResults.busEndTime') }}：
                <span
                  :style="getColorStyle(0)"
                >{{ (busData[line.uuid] || {}).starttime }} - {{ (busData[line.uuid] || {}).endtime }}</span>
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
      this.$emit('show-point-popup', {
        coordinates: [+coordinate[0], +coordinate[1]],
        data: pointInfo,
        from: 'LineString'
      });
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
