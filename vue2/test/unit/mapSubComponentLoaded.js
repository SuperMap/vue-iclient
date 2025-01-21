import flushPromises from "flush-promises";

export default async function mapSubComponentLoaded(wrapper) {
  const loadedFn = jest.fn();
  wrapper.vm.$on('loaded', loadedFn);
  await wrapper.vm.$nextTick();
  await flushPromises();
  expect(loadedFn.mock.calls).toHaveLength(1);
}
