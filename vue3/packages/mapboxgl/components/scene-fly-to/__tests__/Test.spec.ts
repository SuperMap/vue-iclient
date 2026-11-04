import { statisticsFeatures } from '@supermapgis/iclient-components-core/core/utils/statistics';

describe('SceneFlyTo', () => {
  it('should work with core module', () => {
    expect(statisticsFeatures([], [], [], [])).not.toBeUndefined()
  })
})
