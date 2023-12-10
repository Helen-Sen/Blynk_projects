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
    currentTimeOffSet = await commonActions.getCurrentDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate);
    await driver.sleep(waitUiPause);
    var systemTimeZone = commonActions.getSystemTimeZone();
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsTimeOffSet"], systemTimeZone);
    await driver.sleep(waitUiPause * 2);
    console.log("END BEFORE");
  });

  after(async function () {
    await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher2"], 1);
    await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsActivateDetection"], 0);
    await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsTimeOffSet"], currentTimeOffSet);
    await driver.quit();
    console.log("END AFTER");
  });

  //it - describes expected behaviour
  it("Meteo_Boxer - check move alarm", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    await driver.sleep(waitUiPause);
    var systemTime = commonActions.getSystemTime();
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetection = await meteoBoxerActions.getLastAlarmDetection();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");
    assert(secondDifference < 5, "Second difference should be less then 5");

    var alarmMoveState = await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsAlarmMove"]);
    assert.equal(alarmMoveState, 1, "State should show ALARM");
    console.log("---------Move ALARM is detected---------");
  }).timeout(100000);

  it("Meteo_Boxer - check light alarm", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetection = await meteoBoxerActions.getLastAlarmDetection();
    var systemTime = commonActions.getSystemTime();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");
    assert(secondDifference < 10, "Second difference should be less then 10");

    var alarmMoveState = await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsAlarmLight"]);
    assert.equal(alarmMoveState, 1, "State should show ALARM");
    await driver.sleep(waitUiPause);
    await driver.sleep(dataProcessingPause);

    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    var luminosityThreshold = await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsLuminosityThreshold"]
    );
    assert(luminosity > luminosityThreshold, "Luminosity should be more then luminosityThreshold");
    console.log("---------Light ALARM is detected---------");
  }).timeout(100000);
});
