import flushPromises from 'flush-promises';

export default async function mapLoaded(mapVm) {
  await flushPromises();
  mapVm.viewModel.map.fire('load');
}
