var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var meteoBoxerActions = require("../../common/action/meteo_boxer_actions.js");
var currentLuminosityThreshold;
var currentTimeOffSet;

var testLightLuminosity = deviceUnderTestingConfig["testLightLuminosity"];
var belowTestLightLuminosityThreshold = testLightLuminosity - 10;
var aboveTestLightLuminosityThreshold = testLightLuminosity + 10;

//describe - describes test
describe("Meteo_Boxer - check alarm", function () {
  this.timeout(1000000);
  before(async function () {
    console.log("--- BEFORE START ---");
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();

    currentTimeOffSet = await commonActions.getCurrentDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate);
    currentLuminosityThreshold = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"]);
    await driver.sleep(waitUiPause);
    var systemTimeZone = commonActions.getSystemTimeZone();
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsTimeOffSet"], systemTimeZone);
    await driver.sleep(waitUiPause * 2);
    console.log("--- BEFORE END ---");
  });

  after(async function () {
    console.log("--- AFTER START ---");
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"], 1);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsActivateDetection"], 0);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsTimeOffSet"], currentTimeOffSet);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], currentLuminosityThreshold);
    await driver.quit();
    console.log("--- AFTER END ---");
  });
  beforeEach(async function () {
    console.log("--- BEFORE EACH START ---");
    // await meteoBoxerActions.switchLightOff();
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsActivateDetection"], 0);
    await driver.sleep(waitUiPause);
    console.log("--- BEFORE EACH END ---");
  });

  afterEach(async function () {
    console.log("--- AFTER EACH START ---");
    if (await meteoBoxerActions.isLightOn()) {
      await meteoBoxerActions.switchLightOff();
      await driver.sleep(dataProcessingPause);
      console.log("--- switch Light off after test ---");
    }
    console.log("--- AFTER EACH END ---");
  });

  //it - describes expected behaviour
  it("Test1 - Meteo_Boxer - check 'Alarm move', when 'Activate detection' is On", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    // await driver.sleep(waitUiPause);
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

  it("Test2 - Meteo_Boxer - Check only time has changed if move is present even when Activate detection is off", async function () {
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

  it("Test3 - Meteo_Boxer - check 'Alarm light', when 'Activate detection' is On", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    // await driver.sleep(waitUiPause);
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
    await driver.sleep(dataProcessingPause);

    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    var luminosityThreshold = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"]);
    assert(luminosity > luminosityThreshold, "Luminosity should be more then luminosityThreshold");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------Light ALARM is detected---------");
  }).timeout(100000);

  it("Test4 - Meteo_Boxer - check time has changed if luminosity raises above luminosity threshold even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await driver.sleep(waitUiPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    assert(luminosity > belowTestLightLuminosityThreshold, "Luminosity should be more then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time should change");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("--------- Test4 is done ---------");
  }).timeout(100000);

  it("Test5 - Meteo_Boxer - check time has not changed if luminosity raises but not above luminosity threshold even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], aboveTestLightLuminosityThreshold);
    await driver.sleep(waitUiPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    assert(luminosity < aboveTestLightLuminosityThreshold, "Luminosity should be less then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time should NOT change");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------Light is NOT detected---------");
  }).timeout(100000);

  it("Test6 - Meteo_Boxer - check light alarm does not happen if luminosity raises but not above luminosity threshold", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], aboveTestLightLuminosityThreshold);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);
    assert(luminosity < aboveTestLightLuminosityThreshold, "Luminosity should be less then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    var alarmMoveState = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]);
    assert.equal(alarmMoveState, 0, "State should Not show ALARM");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------Light ALARM is NOT detected---------");
  }).timeout(100000);

  it("Test7 - Meteo_Boxer - Check 'Alarm move' state resets after switch 'Activate detection' Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 2);
    var previousMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(await meteoBoxerActions.getAlarmMoveState(), "On", "AlarmMove state shold be On");
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousMoveDetectionTime["lastAlarmDetectionTime"], lastMoveDetectionTime["lastAlarmDetectionTime"], "Time should not change");
    assert.equal(await meteoBoxerActions.getAlarmMoveState(), "Off", "AlarmMove state shold be Off");

    console.log("---------“Alarm move” state resets---------");
  }).timeout(100000);

  it("Test8 - Meteo_Boxer - Check 'Alarm light' state resets after switch 'Activate detection' Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);

    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(await meteoBoxerActions.getAlarmLightState(), "On", "AlarmLight state shold be On");
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause);
    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    assert.equal(await meteoBoxerActions.getAlarmLightState(), "Off", "AlarmLight state shold be Off");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------“Alarm light” state resets---------");
  }).timeout(100000);

  it("Test9 - Meteo_Boxer - Check active 'Alarm light' will not change after switch Light Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    // assert.equal(await meteoBoxerActions.getAlarmLightState(), 'On', "AlarmLight state shold be On");
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");
    await meteoBoxerActions.switchLightOff();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < belowTestLightLuminosityThreshold, "Luminosity should be less than luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    assert.equal(await meteoBoxerActions.getAlarmLightState(), "On", "AlarmLight state shold be On");
    console.log("---------active “Alarm light” will not change after switch Light Off---------");
  }).timeout(100000);

  it("Test10 - Meteo_Boxer - Check 'Date and time' change every time the light is turned on, but  active 'Alarm light' keeps on the same", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);

    assert.equal(await meteoBoxerActions.getAlarmLightState(), "On", "AlarmLight state shold be On");
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.switchLightOff();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < belowTestLightLuminosityThreshold, "Luminosity should be less than luminosityThreshold");
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) > belowTestLightLuminosityThreshold, "Luminosity should be above than luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time MUST change");
    assert.equal(await meteoBoxerActions.getAlarmLightState(), "On", "AlarmLight state shold be On");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("--------- 'Date and time' changes every time the light is turned on, but active “Alarm light” keeps on the same ---------");
  }).timeout(100000);

  it("Test11 - Meteo_Boxer - Check 'Date and time' changes every time after do Move, but active 'Alarm move' keeps on the same", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(dataProcessingPause);
    assert.equal(await meteoBoxerActions.getAlarmMoveState(), "On", "AlarmMove state shold be On");
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    await meteoBoxerActions.doMove();
    await driver.sleep(dataProcessingPause);
    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");
    assert.equal(await meteoBoxerActions.getAlarmMoveState(), "On", "AlarmMove state shold be On");
    console.log("---------“Date and time” changes every time after do Move, but  active “Alarm light” keeps on the same---------");
  }).timeout(100000);

  it("Test12 - Meteo_Boxer - check 'Alarm move' and 'Alarm Light', when 'Activate detection' is On", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    var previousAlarmDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    assert(await meteoBoxerActions.isAlarmMoveStateOn(), "AlarmMove state shold be On");
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");

    assert((await meteoBoxerActions.getLuminosity()) > belowTestLightLuminosityThreshold, "Luminosity should be above than luminosityThreshold");
    var lastAlarmDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.notEqual(previousAlarmDetectionTime["lastAlarmDetectionTime"], lastAlarmDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------Move ALARM and Light ALARM are detected---------");
  }).timeout(100000);

  it("Test13 - Meteo_Boxer - Check time has changed after do move and switch light on when 'Activate detection' is Off and LuminosityThreshold above than luminosity", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], aboveTestLightLuminosityThreshold);
    var previousAlarmDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < aboveTestLightLuminosityThreshold, "Luminosity should be less than luminosityThreshold");
    var lastAlarmDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.notEqual(previousAlarmDetectionTime["lastAlarmDetectionTime"], lastAlarmDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");

    assert.equal(await meteoBoxerActions.getAlarmMoveState(), "Off", "AlarmMove state shold be Off");
    assert.equal(await meteoBoxerActions.getAlarmLightState(), "Off", "AlarmLight state shold be Off");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------time has changed after do move and switch light---------");
  }).timeout(100000);

  it("Test14 - Meteo_Boxer - check 'Alarm move' and 'Alarm Light', when 'Activate detection' is On and Luminosity Threshold above Luminosity", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], aboveTestLightLuminosityThreshold);
    await meteoBoxerActions.switchActivateDetectionState(true);
    var previousAlarmDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause);
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < aboveTestLightLuminosityThreshold, "Luminosity should be above than luminosityThreshold");
    var lastAlarmDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.notEqual(previousAlarmDetectionTime["lastAlarmDetectionTime"], lastAlarmDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");

    assert.equal(await meteoBoxerActions.getAlarmMoveState(), "On", "AlarmMove state shold be On");
    assert.equal(await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]), 0, "dsAlarmLight shold be 0");
    // await meteoBoxerActions.switchLightOff();
    // await driver.sleep(dataProcessingPause);
    console.log("---------Move ALARM and Light ALARM are detected---------");
  }).timeout(100000);
});
