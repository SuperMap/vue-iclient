// var waitForElementClickable = require('../custom-assertions/waitForElementClickable');
var commonTools = require('../base/commonTools');
module.exports = {
  'layer': function (browser) {
    const devServer = browser.globals.devServerURL;
    var componentName = "layer";

    browser
      .url(devServer)
      .waitForElementVisible('#app', 20000)
      .assert.elementPresent('#map')
      .assert.elementPresent('.el-card')
      .pause(10000)
      .assert.cssClassPresent('.el-card', 'is-click-in')
      .click('.sm-icon__el-icon.el-icon-tickets')
      .pause(1000)
      .assert.cssClassPresent('.el-card', 'is-click-out')
      .assert.elementCount('div.sm-layer-list__collapse', 2)
      .click('i.el-icon-view')
      .pause(5000)
    commonTools.cmpTestTileWithStdTile(browser, componentName + '_minhang', 0, 0, 256, 256);

    browser
      .click('i.el-icon-view')
      .useXpath() // every selector now must be xpath
      .click("//div[@class='sm-layer-list__content']/div[2]/div/div/i")
      .pause(5000)
    commonTools.cmpTestTileWithStdTile(browser, componentName + '_china', 0, 0, 256, 256);
    // commonTools.getStdTile_centre(browser, componentName + '_china', 0, 0, 256, 256);
    browser.end()
  }
}
