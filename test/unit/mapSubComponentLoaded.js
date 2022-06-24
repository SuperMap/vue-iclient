export default function mapSubComponentLoaded(wrapper) {
  const loadedFn = jest.fn();
  wrapper.vm.$on({ loaded: loadedFn });
  expect(loadedFn.mock.called).toBeTruthy;
}
