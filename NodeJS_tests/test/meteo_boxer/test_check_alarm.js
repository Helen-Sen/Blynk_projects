var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var meteoBoxerActions = require("../../common/action/meteo_boxer_actions.js");


//describe - describes test
describe("Meteo_Boxer - check alarm", function () {
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
  it("Meteo_Boxer - check move alarm", async function () {
    await commonActions.isDeviceOnline(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await meteoBoxerActions.doMove();
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    



  }).timeout(100000);
});


