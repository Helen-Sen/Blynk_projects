var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var meteoBoxerActions = require("../../common/action/meteo_boxer_actions.js");
var currentLuminosityThreshold;
var currentTimeOffSet;

//describe - describes test
describe("Meteo_Boxer - check alarm", function () {
  this.timeout(1000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"], 1);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsActivateDetection"], 0);
    currentTimeOffSet = await commonActions.getCurrentDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate);
    currentLuminosityThreshold = await commonActions.getDataStreamValue2(
      deviceUnderTestingConfig,
      deviceUnderTestingTemplate["dsLuminosityThreshold"]
    );
    await driver.sleep(waitUiPause);
    var systemTimeZone = commonActions.getSystemTimeZone();
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsTimeOffSet"], systemTimeZone);
    await driver.sleep(waitUiPause * 2);
    console.log("END BEFORE");
  });

  after(async function () {
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"], 1);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsActivateDetection"], 0);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsTimeOffSet"], currentTimeOffSet);
    await commonActions.setDataStreamValue2(
      deviceUnderTestingConfig,
      deviceUnderTestingTemplate["dsLuminosityThreshold"],
      currentLuminosityThreshold
    );
    await driver.quit();
    console.log("END AFTER");
  });
  beforeEach(async function () {
    await meteoBoxerActions.switchLightOff();
  });

  afterEach(async function () {
    // runs after each test in this block
  });

  //it - describes expected behaviour
  it("Test1 - Meteo_Boxer - check move alarm", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    await driver.sleep(waitUiPause);
    var systemTime = commonActions.getSystemTime();
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetection = await meteoBoxerActions.getAlarmDetectionTime();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");
    assert(secondDifference < 5, "Second difference should be less then 5");

    var alarmMoveState = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]);
    assert.equal(alarmMoveState, 1, "State should show ALARM");
    console.log("---------Move ALARM is detected---------");
  }).timeout(100000);

  it("Test2 - Meteo_Boxer - check light alarm", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetection = await meteoBoxerActions.getAlarmDetectionTime();
    var systemTime = commonActions.getSystemTime();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");
    assert(secondDifference < 10, "Second difference should be less then 10");

    var alarmMoveState = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]);
    assert.equal(alarmMoveState, 1, "State should show ALARM");
    await driver.sleep(waitUiPause);
    await driver.sleep(dataProcessingPause);

    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    var luminosityThreshold = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"]);
    assert(luminosity > luminosityThreshold, "Luminosity should be more then luminosityThreshold");
    console.log("---------Light ALARM is detected---------");
  }).timeout(100000);

  it("Test3 - Meteo_Boxer - check only time has changed if move is present even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    var previousMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 3);
    var lastMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousMoveDetectionTime["lastAlarmDetectionTime"], lastMoveDetectionTime["lastAlarmDetectionTime"], "Time should change");
    var alarmMoveState = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]);
    assert.equal(alarmMoveState, 0, "State should Not show ALARM");

    console.log("---------Move is detected---------");
  }).timeout(100000);

  it("Test4 - Meteo_Boxer - check time has changed if luminosity raises above luminosity threshold even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    var luminosityThreshold = 60;
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], luminosityThreshold);
    await driver.sleep(waitUiPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    assert(luminosity > luminosityThreshold, "Luminosity should be more then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time should change");

    console.log("---------Light is detected---------");
  }).timeout(100000);

  it("Test5 - Meteo_Boxer - check time has not changed if luminosity raises but not above luminosity threshold even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    var luminosityThreshold = 80;
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], luminosityThreshold);
    await driver.sleep(waitUiPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    assert(luminosity < luminosityThreshold, "Luminosity should be less then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time should NOT change");

    console.log("---------Light is NOT detected---------");
  }).timeout(100000);

  it("Test6 - Meteo_Boxer - check light alarm does not happen if luminosity raises but not above luminosity threshold", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    var luminosityThreshold = 80;
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], luminosityThreshold);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);
    assert(luminosity < luminosityThreshold, "Luminosity should be less then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    var alarmMoveState = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]);
    assert.equal(alarmMoveState, 0, "State should Not show ALARM");
    console.log("---------Light ALARM is NOT detected---------");
  }).timeout(100000);
});
