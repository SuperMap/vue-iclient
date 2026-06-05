import { statisticsFeatures } from 'vue-iclient-core/utils/statistics';

describe('SceneFullscreen', () => {
  it('should work with core module', () => {
    expect(statisticsFeatures([], [], [], [])).not.toBeUndefined()
  })
})
