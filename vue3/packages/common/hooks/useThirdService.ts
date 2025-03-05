import { ref, watch } from 'vue';
import RestService from 'vue-iclient-core/utils/RestService';

export function useThirdService(props: {
  url: string;
  field: string;
  proxy: string
}, finalValue) {
  const features = ref<any>(null);
  const restService = ref<RestService | null>(null);

  const getData = () => {
    if (!restService.value) {
      restService.value = new RestService({ proxy: props.proxy });
      restService.value.on({ getdatasucceeded: fetchData });
    }
    restService.value.getData(props.url);
  };

  const fetchData = ({ features: newFeatures }: { features: any[] }) => {
    features.value = newFeatures;
    setValue(newFeatures);
  };

  const setValue = (features: any[]) => {
    if (features?.length) {
      const field = props.field;
      finalValue.value = features[0].properties[field];
    }
  };

  watch(() => props.url, (newVal) => {
    newVal && getData();
  }, { immediate: true });

  watch(() => props.field, () => {
    props.url && setValue(features.value);
  });

  watch(() => props.proxy, () => {
    restService.value?.setProxy(props.proxy);
    props.url && getData();
  });

  return {
    restService,
    getData
  };
}