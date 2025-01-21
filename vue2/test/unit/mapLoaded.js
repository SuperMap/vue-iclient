import flushPromises from 'flush-promises';

export default async function mapLoaded(mapVm) {
  jest.useFakeTimers();
  await mapVm.$nextTick();
  await flushPromises();
  jest.advanceTimersByTime(120);
  mapVm.viewModel.map.fire('load');
  jest.useRealTimers();
}
