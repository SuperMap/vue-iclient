import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import MapEvents, { MAP_EVENT_NAMES } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents';

@Component
export default class MapEventsMixin extends Vue {
  bindMapEvents(map?: mapboxglTypes.Map): void {
    const mapEvents = new MapEvents(Object.keys(this.$listeners));
    const builtInEvents = MAP_EVENT_NAMES.reduce((listeners, eventName) => {
      listeners[eventName] = ({ mapParams }: { mapParams: Record<string, any> }) => {
        this.$emit(eventName, {
          ...mapParams,
          component: this
        });
      };
      return listeners;
    }, {} as Record<string, (params: { mapParams: Record<string, any> }) => void>);
    mapEvents.on(builtInEvents);
    mapEvents.bindMapEvents(map);
  }
}
