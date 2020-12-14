<template>
  <div v-if="data" class="linedata-results-container sm-component-tdtLineResults">
    <a class="link-to-points" @click="searchPointsResult">
      {{ $t('tdtResults.relateAdress', { keyWord: keyWord }) }}
    </a>
    <div class="title" :style="secondaryTextColorStyle">
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
          <div class="cover-info" :style="headingTextColorStyle">
            <div class="name" :title="stationName(line.name)">{{ stationName(line.name) }}</div>
            <div class="line-info">
              <div class="description-holder">
                <i class="sm-components-icon-arrow-dowm-slim" />
                <div class="description">
                  <div>{{ stationInfo(line.name).start }}</div>
                  <div>{{ stationInfo(line.name).dest }}</div>
                </div>
              </div>
              <p class="time" :style="secondaryTextColorStyle">
                {{ $t('tdtResults.busEndTime') }}：
                <span> {{ (busData[line.uuid] || {}).starttime }} - {{ (busData[line.uuid] || {}).endtime }} </span>
              </p>
            </div>
          </div>
          <div class="detail-info">
            <div class="detail-title">
              <p class="show-details" @click="showLineDetail(line.uuid, groupIndex)">
                <span>{{ $t('tdtResults.showDetail') }}</span>
                <i
                  :class="
                    detailVisibles[groupIndex]
                      ? 'sm-components-icon-solid-triangle-up'
                      : 'sm-components-icon-solid-triangle-down'
                  "
                />
              </p>
              <p class="count" :style="disabledTextColorStyle">
                {{ $t('tdtResults.total') }}
                <span>{{ line.stationNum }}</span>
                {{ $t('tdtResults.station') }}
              </p>
            </div>
            <ul v-if="detailVisibles[groupIndex] && busData[line.uuid]" class="lines">
              <li
                v-for="(bus, index) in (busData[line.uuid] || {}).station || []"
                :key="bus.uuid"
                :class="{ 'active-station': popupUuid === bus.uuid }"
                :style="secondaryTextColorStyle"
                @click="generatePopup(bus)"
              >
                {{ `${index + 1}、${bus.name}` }}
              </li>
            </ul>
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
      detailVisibles: [true],
      popupUuid: null
    };
  },
  computed: {
    stationName() {
      return function(name) {
        return name && name.replace(/(.+)\(.+/, '$1');
      };
    },
    stationInfo() {
      return function(name) {
        const stationStr = name && name.replace(/.+\((.+)\)/, '$1');
        const stations = stationStr && stationStr.split('-');
        if (!stations || !stations.length) {
          return {};
        }
        return {
          start: stations[0],
          dest: stations[stations.length - 1]
        };
      };
    }
  },
  watch: {
    busData() {
      this.data.forEach(item => {
        if (item.uuid && !this.busData[item.uuid]) {
          this.$emit('show-line-detail', item.uuid, false);
        }
      });
    }
  },
  methods: {
    generatePopup(pointInfo) {
      this.popupUuid = pointInfo.uuid;
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
