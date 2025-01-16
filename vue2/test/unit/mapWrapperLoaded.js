import flushPromises from 'flush-promises';

export default async function mapWrapperLoaded(wrapper) {
  jest.useFakeTimers();
  await wrapper.vm.$nextTick();
  await flushPromises();
  jest.advanceTimersByTime(120);
  wrapper.vm.viewModel.map.fire('load');
  jest.useRealTimers();
}
