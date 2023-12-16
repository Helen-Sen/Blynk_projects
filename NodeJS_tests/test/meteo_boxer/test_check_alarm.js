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
    var systemTime = commonActions.getSystemTime();
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetection = await meteoBoxerActions.getAlarmDetectionTime();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");
    assert(secondDifference < 5, "Second difference should be less then 5");
    assert(await meteoBoxerActions.isAlarmMoveStateOn(), "AlarmMove state shold be On");

    console.log("------- Test1 is done ---------");
  }).timeout(100000);

  it("Test2 - Meteo_Boxer - Check only time has changed if move is present even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    var previousMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousMoveDetectionTime["lastAlarmDetectionTime"], lastMoveDetectionTime["lastAlarmDetectionTime"], "Time should change");
    assert(!(await meteoBoxerActions.isAlarmMoveStateOn()), "AlarmMove state shold be Off");

    console.log("------- Test2 is done ---------");
  }).timeout(100000);

  it("Test3 - Meteo_Boxer - check 'Alarm light', when 'Activate detection' is On", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var lastMoveDetection = await meteoBoxerActions.getAlarmDetectionTime();
    var systemTime = commonActions.getSystemTime();
    var secondDifference = Math.abs(lastMoveDetection["lastAlarmDetectionSeconds"] - systemTime["systemSeconds"]);

    assert.equal(lastMoveDetection["lastAlarmDetectionHours"], systemTime["systemHours"], "Move detection hours not match with system hours");
    assert.equal(lastMoveDetection["lastAlarmDetectionMinutes"], systemTime["systemMinutes"], "Move detection minutes not match with system minutes");
    assert(secondDifference < 10, "Second difference should be less then 10");
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");
    await driver.sleep(waitUiPause);

    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);
    assert(luminosity > belowTestLightLuminosityThreshold, "Luminosity should be more then luminosityThreshold");

    console.log("------- Test3 is done ---------");
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

    console.log("--------- Test4 is done ---------");
  }).timeout(100000);

  it("Test5 - Meteo_Boxer - check time has not changed if luminosity raises but not above luminosity threshold even when Activate detection is off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], aboveTestLightLuminosityThreshold);
    await driver.sleep(waitUiPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(false);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);

    assert(luminosity < aboveTestLightLuminosityThreshold, "Luminosity should be less then luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time should NOT change");

    console.log("-------- Test5 is done ---------");
  }).timeout(100000);

  it("Test6 - Meteo_Boxer - check light alarm does not happen if luminosity raises but not above luminosity threshold", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], aboveTestLightLuminosityThreshold);
    await driver.sleep(waitUiPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);
    assert(luminosity < aboveTestLightLuminosityThreshold, "Luminosity should be less then luminosityThreshold");
    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    assert(!(await meteoBoxerActions.isAlarmMoveStateOn()), "AlarmMove state shold be Off");

    console.log("-------- Test6 is done ---------");
  }).timeout(100000);

  it("Test7 - Meteo_Boxer - Check 'Alarm move' state resets after switch 'Activate detection' Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(dataProcessingPause);
    var previousMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert(await meteoBoxerActions.isAlarmMoveStateOn(), "AlarmMove state shold be On");
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause);
    var lastMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousMoveDetectionTime["lastAlarmDetectionTime"], lastMoveDetectionTime["lastAlarmDetectionTime"], "Time should not change");
    assert(!(await meteoBoxerActions.isAlarmMoveStateOn()), "AlarmMove state shold be Off");

    console.log("-------- Test7 is done ---------");
  }).timeout(100000);

  it("Test8 - Meteo_Boxer - Check 'Alarm light' state resets after switch 'Activate detection' Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);

    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    var luminosity = await meteoBoxerActions.getLuminosity();
    console.log("luminosity = %s", luminosity);
    assert(luminosity > belowTestLightLuminosityThreshold, "Luminosity should be above then luminosityThreshold");
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");

    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause);
    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed"); 
    assert(!(await meteoBoxerActions.isAlarmLightStateOn()), "AlarmLight state shold be Off");
    console.log("-------- Test8 is done ---------");
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
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");
    await meteoBoxerActions.switchLightOff();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < belowTestLightLuminosityThreshold, "Luminosity should be less than luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");
    console.log("-------- Test9 is done ---------");
  }).timeout(100000);

  it("Test10 - Meteo_Boxer - Check 'Date and time' change every time the light is turned on, but  active 'Alarm light' keeps on the same", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], belowTestLightLuminosityThreshold);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);

    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.switchLightOff();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < belowTestLightLuminosityThreshold, "Luminosity should be less than luminosityThreshold");
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) > belowTestLightLuminosityThreshold, "Luminosity should be above than luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time MUST change");
    assert(await meteoBoxerActions.isAlarmLightStateOn(), "AlarmLight state shold be On");

    console.log("-------- Test10 is done ---------");
  }).timeout(100000);

  it("Test11 - Meteo_Boxer - Check 'Date and time' changes every time after do Move, but active 'Alarm move' keeps on the same", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(dataProcessingPause);
    assert(await meteoBoxerActions.isAlarmMoveStateOn(), "AlarmMove state shold be On");
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    await meteoBoxerActions.doMove();
    await driver.sleep(dataProcessingPause);
    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");
    assert(await meteoBoxerActions.isAlarmMoveStateOn(), "AlarmMove state shold be On");
    console.log("-------- Test11 is done ---------");
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

    console.log("-------- Test12 is done ---------");
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

    assert(!(await meteoBoxerActions.isAlarmMoveStateOn()), "AlarmMove state shold be Off");
    assert(!(await meteoBoxerActions.isAlarmLightStateOn()), "AlarmLight state shold be Off");

    console.log("-------- Test13 is done ----------");
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

    assert(await meteoBoxerActions.isAlarmMoveStateOn(), "AlarmMove state shold be On");
    assert(!(await meteoBoxerActions.isAlarmLightStateOn()), "AlarmLight state shold be Off");
    console.log("-------- Test14 is done ----------");
  }).timeout(100000);
});
