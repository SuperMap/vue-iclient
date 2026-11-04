import { statisticsFeatures } from '@supermapgis/iclient-components-core/core/utils/statistics';

describe('SceneFullscreen', () => {
  it('should work with core module', () => {
    expect(statisticsFeatures([], [], [], [])).not.toBeUndefined()
  })
})
