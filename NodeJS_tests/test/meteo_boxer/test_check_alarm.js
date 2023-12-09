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
    await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher2"], 1);
    await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsActivateDetection"], 0);
    console.log("END BEFORE");
  });

  after(async function () {
    await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher2"], 1);
    await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsActivateDetection"], 0);
    await driver.quit();
    console.log("END AFTER");
  });

  //it - describes expected behaviour
  it("Meteo_Boxer - check move alarm", async function () {
    var systemTimeZone = commonActions.getSystemTimeZone();
    await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsTimeOffSet"], systemTimeZone);
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause);
    var lastMoveDetection = await meteoBoxerActions.getLastAlarmDetection();
    var systemTime = commonActions.getSystemTime();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");

    assert(secondDifference < 10, "Second difference should be less then 10");
  }).timeout(100000);
});
