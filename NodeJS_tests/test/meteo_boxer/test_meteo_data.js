var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
// var meteoBoxerActions = require("../../common/action/meteoboxer_actions.js");

//describe - describes test
describe("Meteo_Boxer - check meteodata", function () {
  this.timeout(1000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    console.log("END BEFORE");
  });

  after(async function () {
    // await driver.quit();
    console.log("END AFTER");
  });

  //it - describes expected behaviour
  it("Meteo_Boxer - check meteodata", async function () {
    await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsGeneralData"]
    );
    await driver.sleep(waitUiPause);
    await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsMeteoData"]
    );
    await driver.sleep(waitUiPause);
    await commonActions.isDeviceOnline(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
  }).timeout(100000);
});
