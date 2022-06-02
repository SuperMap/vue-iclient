export default function videoPlusSubComponentLoaded(wrapper) {
  const loadedFn = jest.fn();
  wrapper.vm.$on({ loaded: loadedFn });
  expect(loadedFn.mock.called).toBeTruthy;
}