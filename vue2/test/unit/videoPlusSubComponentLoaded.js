export default function videoPlusSubComponentLoaded(wrapper) {
  const loadFn = jest.fn();
  wrapper.vm.$on({ load: loadFn });
  expect(loadFn.mock.called).toBeTruthy;
}