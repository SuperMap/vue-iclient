<template>
  <div id="app" style="position:relative;">
    <sm-radio-group v-model="componentType" button-style="solid" class="display-diff-components">
      <sm-radio-button value="map-sub-components">地图子组件</sm-radio-button>
      <!-- <sm-radio-button value="map-layers">
        地图图层
      </sm-radio-button>-->
      <sm-radio-button value="chart-components">图表组件</sm-radio-button>
      <sm-radio-button value="basic-components">基础组件</sm-radio-button>
    </sm-radio-group>
    <template v-if="componentType === 'map-sub-components'">
      <sm-web-map
        v-if="show"
        server-url="http://localhost:8190/iportal"
        :map-id="mapIdSelected"
        :pan-control="{ show: true, position: 'top-left' }"
        @load="mapLoaded"
      >
        <!-- server-url="http://192.168.11.94:8190/iportal"
        map-id="446054158" -->
        <!-- <sm-web-map
        target="map2"
        v-if="show"
        server-url="http://192.168.11.94:8190/iportal"
        map-id="446054158"
        :style="{ height: '400px', position:'relative', top: '400px' }"
        :pan-control="{ show: true, position: 'top-left' }"
        @load="mapLoaded"
      ></sm-web-map> -->
        <sm-pan />
        <sm-zoom :show-zoom-slider="true" />
        <sm-layer-list position="top-right" />
        <sm-measure position="top-right" />
        <sm-legend :layerNames="['民航数据']" position="bottom-right" :collapsed="false" />
        <sm-query
          :iportal-data="iportalDataQuery"
          :rest-data="restDataQuery"
          :rest-map="restMapQuery"
          position="top-right"
        />
        <sm-search
          position="top-right"
          :layer-names="layerSourceNames"
          :address-match="addressMatch"
          :rest-map="restMapSearch"
          :rest-data="restDataSearch"
          :iportal-data="iportalData"
          :online-local-search="onlineLocalSearch"
          :alwaysCenter="false"
          collapsed
        />
        <sm-layer-manager position="top-right" :layers="treeDatas" :default-expand-all="true" />
        <sm-tdt-search
          position="top-left"
          :layer-names="layerSourceNames"
          :address-match="addressMatch"
          :rest-map="restMapSearch"
          :rest-data="restDataSearch"
          :online-local-search="onlineLocalSearch"
          :alwaysCenter="false"
          :data="searchData"
          collapsed
        />
        <sm-tdt-route position="top-left" :data="routeData" />
        <sm-tdt-map-switcher position="top-left" :data="mapSwitcherData" />
        <sm-mini-map position="bottom-right" />
        <sm-identify :layers="inputLayers"></sm-identify>
        <sm-input v-model="layerNamesInput" @blur="e => inputLayers = e.target.value.split(',')"></sm-input>
      </sm-web-map>
    </template>

    <template v-if="componentType === 'chart-components'">
      <!-- <div id="beforeMap" style="height: 100vh"></div>
      <div id="afterMap" style="height: 100vh"></div> -->
      <sm-compare
        :beforeMapOptions='{
                        target: "beforeMap",
                        serverUrl: "http://localhost:8190/iportal",
                        mapId: 617580084,
                        mapOptions: {
                            center: [-39.9535, 38.0542],
                            zoom: 2.44

                        }
                    }'
        :afterMapOptions='{
                        target: "afterMap",
                        serverUrl: "http://localhost:8190/iportal",
                        mapId: 649033069,
                        mapOptions: {
                            center: [-39.9535, 38.0542],
                            zoom: 2.44

                        }
                    }'
      >
      </sm-compare>
      <!-- <sm-border type="border1" style="width: 460px; height: 260px;">
        <sm-chart
          :colorGroup="['red', 'blue']"
          :options="echartOption"
          :dataset="dataset"
          :datasetOptions="datasetOptions"
          iconClass
        />
      </sm-border>
      <sm-progress strokeColor="red" type="circle" :percent="80" />
      <sm-liquid-fill bordercolor="blue" waveColor="red" :value="0.3" :waveCount="1" position="bottom-right" /> -->
    </template>

    <template v-if="componentType === 'basic-components'">
      <sm-indicator title="人均收入" unit="元" indicatorColor="red" textColor="red" :num="12323412" fontSize="18" />
      <sm-text
        title="文本框"
        textColor="red"
        :fontStyle="{ fontSize: '18px', lineHeight: '18px', fontWeight: '700', textAlign: 'center' }"
      />
      <sm-time-text :fontStyle="{ fontSize: '18', fontWeight: '700' }" timeType="date+second+week" />
      <div class="buttons">
        <sm-button type="primary" loading>主按钮</sm-button>
        <sm-button type="default">次按钮</sm-button>
        <sm-button type="danger" loading>危险按钮</sm-button>
        <sm-button disabled>禁用按钮</sm-button>
        <sm-button type="dashed">Dash按钮</sm-button>
        <sm-button type="link">文字按钮</sm-button>
        <sm-button loading disabled>loading按钮</sm-button>
        <sm-button icon="search" />
      </div>
      <div class="inputs">
        <sm-input allowClear />
        <sm-input-number />
        <sm-input-password :default-value="77" />
        <sm-input-search enter-button="Search" />
        <sm-textarea allowClear rows="5" cols="33" />
      </div>
      <div class="switchs">
        <sm-switch />
        <sm-switch v-model="switch1" checked-children="开" un-checked-children="关" />
        <sm-switch checked-children="1" un-checked-children="0" default-checked />
        <sm-switch loading />
        <sm-switch disabled checked-children="开" un-checked-children="关" />
      </div>

      <div class="selects">
        <sm-select allowClear default-value="lucy" style="width: 120px" :options="[]"></sm-select>
        <sm-select default-value="lucy1" disabled style="width: 120px">
          <sm-select-option value="jack1">Jack</sm-select-option>
          <sm-select-option value="lucy1">Lucy</sm-select-option>
          <sm-select-option value="disabled" disabled>Disabled</sm-select-option>
          <sm-select-option value="Yiminghe1">yiminghe</sm-select-option>
        </sm-select>
        <sm-select default-value="lucy" style="width: 200px">
          <sm-select-opt-group>
            <span slot="label"> <sm-icon type="user" />Manager </span>
            <sm-select-option value="jack">Jack</sm-select-option>
            <sm-select-option value="lucy">Lucy</sm-select-option>
          </sm-select-opt-group>
          <sm-select-opt-group label="Engineer">
            <sm-select-option value="Yiminghe">yiminghe</sm-select-option>
          </sm-select-opt-group>
        </sm-select>
        <sm-select mode="multiple" placeholder="Please select" :default-value="['a1', 'b2']" style="width: 200px">
          <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">{{
            (i + 9).toString(36) + i
          }}</sm-select-option>
        </sm-select>
      </div>

      <div class="checkboxs">
        <sm-checkbox v-model="switch1">Checkbox</sm-checkbox>
        <sm-checkbox default-checked disabled />
        <sm-checkbox disabled />
        <sm-checkbox default-checked />
        <sm-checkbox default-checked disabled>Checkbox</sm-checkbox>
        <sm-checkbox-group v-model="checkbox1" name="checkboxgroup" :options="plainOptions1" />
        <sm-checkbox-group :options="plainOptions" disabled :default-value="['Apple']">
          <span slot="label" slot-scope="{ value }" style="color: red">{{ value }}</span>
        </sm-checkbox-group>
        <sm-checkbox indeterminate>Check all</sm-checkbox>
        <sm-checkbox indeterminate disabled>Check all</sm-checkbox>
      </div>

      <div class="avatars">
        <sm-avatar size="large" iconClass="sm-components-icon-search" />
        <sm-avatar icon="user" />
        <sm-avatar size="small" icon="user" />
        <sm-avatar>U</sm-avatar>
        <sm-avatar />
        <sm-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      </div>

      <div class="empties">
        <sm-empty />
      </div>

      <div class="dates">
        <sm-date-picker />
        <sm-month-picker placeholder="Select month" />
        <sm-week-picker placeholder="Select week" />
      </div>

      <div class="radios">
        <sm-radio>Radio</sm-radio>
        <sm-radio :default-checked="false" disabled>Disabled</sm-radio>
        <sm-radio default-checked :disabled="true">Disabled</sm-radio>
        <sm-radio-group v-model="input1">
          <sm-radio-button value="a">Hangzhou</sm-radio-button>
          <sm-radio-button value="b" disabled>Shanghai</sm-radio-button>
          <sm-radio-button value="c">Beijing</sm-radio-button>
          <sm-radio-button value="d">Chengdu</sm-radio-button>
        </sm-radio-group>
        <sm-radio-group disabled default-value="a" size="large">
          <sm-radio-button value="a">Hangzhou</sm-radio-button>
          <sm-radio-button value="b">Shanghai</sm-radio-button>
          <sm-radio-button value="c">Beijing</sm-radio-button>
          <sm-radio-button value="d">Chengdu</sm-radio-button>
        </sm-radio-group>
      </div>

      <div class="tabs">
        <sm-radio-group v-model="tabPosition" style="margin:8px">
          <sm-radio-button value="top">top</sm-radio-button>
          <sm-radio-button value="bottom">bottom</sm-radio-button>
          <sm-radio-button value="left">left</sm-radio-button>
          <sm-radio-button value="right">right</sm-radio-button>
        </sm-radio-group>
        <sm-tabs default-active-key="1" :tab-position="tabPosition">
          <sm-tab-pane key="1" tab="Tab 1">Content of Tab 1</sm-tab-pane>
          <sm-tab-pane key="2" tab="Tab 2">Content of Tab 2</sm-tab-pane>
          <sm-tab-pane key="3" tab="Tab 3">Content of Tab 3</sm-tab-pane>
        </sm-tabs>
      </div>
      <sm-time-slider
        v-bind="timePlayer"
        style="position:absolute; top:100px;left:200px;z-index：100000"
      ></sm-time-slider>
      <sm-time-line v-bind="timeLine" style="position:absolute; top:300px;left:200px;z-index：100000"></sm-time-line>
      <sm-time-range v-bind="timeRange" style="position:absolute; top:500px;left:200px;z-index：100000"></sm-time-range>
    </template>

    <div class="changeTheme">
      <!-- <sm-button @click="changeStyle">深色主题</sm-button>
      <sm-button @click="changeStyle1">浅色主题</sm-button>
      <sm-button @click="changeStyle3">暖灰色主题</sm-button>
      <sm-button @click="changeStyle2">透明主题</sm-button> -->
      <sm-select :options="webMapSelection" v-model="mapIdSelected" style="width: 220px"></sm-select>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import data from './data/data.js';

var host = 'http://support.supermap.com.cn:8090';
export default Vue.extend({
  name: 'App',
  mixins: [data], // demo data
  data() {
    return {
      layerNamesInput: '',
      inputLayers: [],
      webMapSelection: [
        { label: 'raster(png) 图层', value: '617580084'},
        { label: 'raster(webp) 图层', value: '1175084848'},
        { label: 'vector(mvt) 图层', value: '1911445594'},
        { label: 'symbol 图层', value: '769608713'},
        { label: '标记图层', value: '1243732508'},
        { label: '天地图（经纬度）', value: '553036596'},
        { label: '单值专题图-点线', value: '1942263014'},
        { label: '单值专题图-面', value: '1414045798'},
        { label: '分段专题图', value: '1951546125'},
        { label: '热力图', value: '1338195847'},
        { label: 'wmts 图层', value: '1953858999'},
        { label: 'wms 图层', value: '649033069'},
        { label: '3D 拉伸图层', value: '1481406908'},
        { label: '空地图', value: '17311606'},
        { label: '相同source多layer', value: '1703080254'},
      ],
      mapIdSelected: '617580084'
    }
  }
});
</script>

<style lang="scss">
body {
  margin: 0;
  // overflow: hidden;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}
#app {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  padding-top: 70px;
  .sm-component-web-map {
    position: absolute;
    left: 0;
    top: 0;
  }
  .sm-component-liquidFill,
  .sm-component-progress {
    width: 10%;
    display: inline-block;
    vertical-align: middle;
  }
  > div {
    margin-bottom: 10px;
  }
  .buttons > button {
    margin-right: 5px;
  }
  .inputs > * {
    width: 18%;
    vertical-align: top;
  }
}
#app .display-diff-components,
.changeTheme {
  position: absolute;
  left: 50%;
  transform: translate(-100px);
  z-index: 100;
}
.display-diff-components {
  top: 20px;
}
.changeTheme {
  bottom: 20px;
}
</style>
