<template>
  <div v-if="data" class="linedata-results-container sm-component-tdtLineResults">
    <a
      class="link-to-points"
      @click="searchPointsResult"
    >
      {{ $t('tdtResults.relateAdress', {keyWord: keyWord}) }}
    </a>
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
          :class="{ 'line-item': true, 'active-item': detailVisibles[groupIndex] }"
        >
          <i class="line-icon" />
          <div class="line-info">
            <p class="name" :title="line.name">{{ line.name }}</p>
            <p class="count">
              {{ $t('tdtResults.total') }}
              <span>{{ line.stationNum }}</span>
              {{ $t('tdtResults.station') }}
            </p>
            <p class="show-details" @click="showLineDetail(line.uuid, groupIndex)">
              <span>{{ $t('tdtResults.showDetail') }}</span>
              <i :class="detailVisibles[groupIndex] ? 'sm-components-icon-solid-triangle-up' : 'sm-components-icon-solid-triangle-down'" />
            </p>
            <div v-if="detailVisibles[groupIndex] && busData[line.uuid]" class="detail-info">
              <p class="time">
                {{ $t('tdtResults.busEndTime') }}：
                <span>
                  {{ (busData[line.uuid] || {}).starttime }} - {{ (busData[line.uuid] || {}).endtime }}
                </span>
              </p>
              <ul class="lines" :style="getBackgroundStyle">
                <li
                  v-for="(bus, index) in ((busData[line.uuid] || {}).station || [])"
                  :key="bus.uuid"
                  @click="generatePopup(bus)"
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
import Theme from '../../../common/_mixin/Theme';

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
