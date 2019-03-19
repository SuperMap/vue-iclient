
var commonTools = require('../base/commonTools');

module.exports = {
  'zoom': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL;
    var height = '27.2656px';
    browser
      .url(devServer)
      .waitForElementVisible('#app', 20000)
      .assert.elementPresent('#map')
      .assert.elementCount('.sm-pan__icon', 4)
      .assert.elementPresent('.sm-zoom__buttons')
      .assert.elementPresent('#miniMap')
      .assert.elementPresent('.sm-measure')
      .assert.elementPresent('div.el-slider__bar')
  

    //测试过程中截取地图瓦片, 和已有的标准瓦片进行对比
    //运行一次得到基准图片
    var componentName = "zoom";
    commonTools.cmpTestTileWithStdTile(browser, componentName + '_before', 0, 0, 256, 256);
    browser.expect.element('div.el-slider__bar').to.have.css('height').which.equals(height).after(5000);
    browser.click('i.el-icon-plus');

    browser.expect.element('div.el-slider__bar').to.have.css('height').which.not.equals(height).after(5000);
    commonTools.cmpTestTileWithStdTile(browser, componentName + '_after', 0, 0, 256, 256);
    browser.click('i.el-icon-minus')

    browser.expect.element('div.el-slider__bar').to.have.css('height').which.equals(height).after(5000);
    commonTools.cmpTestTileWithStdTile(browser,  componentName + '_before', 0, 0, 256, 256);

    browser.end();
  }
}
