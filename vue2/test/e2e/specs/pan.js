var commonTools = require('../base/commonTools');

module.exports = {

  'pan and miniMap': function (browser) {
    const devServer = browser.globals.devServerURL;
    var componentName = "pan";

    browser
      .url(devServer)
      .waitForElementVisible('#app', 20000)
      .assert.elementPresent('#map')
      .waitForElementVisible('.is-left', 1000000)
   
    commonTools.clickAndCheck(browser, 'left')
    commonTools.clickAndCheck(browser, 'right')
    commonTools.clickAndCheck(browser, 'top')
    commonTools.clickAndCheck(browser, 'bottom')

    browser.end()
  }
}


