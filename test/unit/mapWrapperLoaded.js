import flushPromises from 'flush-promises';

export default async function mapWrapperLoaded(mapVm) {
  await flushPromises();
  mapVm.vm.viewModel.map.fire('load');
  await flushPromises();
}
