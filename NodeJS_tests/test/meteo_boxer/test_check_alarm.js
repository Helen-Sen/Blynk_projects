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
    // await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    // await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"], 1);

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
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsActivateDetection"], 0);
    await driver.sleep(waitUiPause);
  });

  afterEach(async function () {
    // runs after each test in this block
  });

  //it - describes expected behaviour
  it("Test1 - Meteo_Boxer - check "Alarm move", when "Activate detection" is On", async function () {
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

  it("Test3 - Meteo_Boxer - check "Alarm light", when "Activate detection" is On", async function () {
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

  it("Test7 - Meteo_Boxer - Check “Alarm move” state resets after switch “Activate detection” Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.doMove();
    await driver.sleep(waitUiPause * 2);
    var previousMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]),
      1,
      "dsAlarmMove shold be 1"
    );
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause * 2);
    var lastMoveDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(previousMoveDetectionTime["lastAlarmDetectionTime"], lastMoveDetectionTime["lastAlarmDetectionTime"], "Time should not change");
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]),
      0,
      "dsAlarmMove shold be 0"
    );

    console.log("---------“Alarm move” state resets---------");
  }).timeout(100000);

  it("Test8 - Meteo_Boxer - Check “Alarm light” state resets after switch “Activate detection” Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    var luminosityThreshold = 60;
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], luminosityThreshold);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause * 2);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]),
      1,
      "dsAlarmLight shold be 1"
    );
    await meteoBoxerActions.switchActivateDetectionState(false);
    await driver.sleep(waitUiPause * 2);
    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]),
      0,
      "dsAlarmLight shold be 0"
    );
    console.log("---------“Alarm light” state resets---------");
  }).timeout(100000);

  it("Test9 - Meteo_Boxer - Check active “Alarm light” will not change after switch Light Off", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    var luminosityThreshold = 60;
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], luminosityThreshold);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]),
      1,
      "dsAlarmLight shold be 1"
    );
    await meteoBoxerActions.switchLightOff();
    await driver.sleep(waitUiPause * 2);
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < luminosityThreshold, "Luminosity should be less than luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.equal(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time shouldn't changed");
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]),
      1,
      "dsAlarmLight shold be 1"
    );
    console.log("---------active “Alarm light” will not change after switch Light Off---------");
  }).timeout(100000);

  it("Test10 - Meteo_Boxer - Check active “Alarm move” state will not change after do Move", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 0);
    await driver.sleep(dataProcessingPause);
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]),
      1,
      "dsAlarmMove shold be 1"
    );
    await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
    await driver.sleep(dataProcessingPause);

    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]),
      1,
      "dsAlarmMove shold be 1"
    );
    console.log("---------active “Alarm move” state will not change after do Move---------");
  }).timeout(100000);

  it("Test11 - Meteo_Boxer - Check “Date and time” change every time the light is turned on, but  active “Alarm light” keeps on the same", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    var luminosityThreshold = 60;
    await commonActions.setDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"], luminosityThreshold);
    await meteoBoxerActions.switchActivateDetectionState(true);
    await driver.sleep(waitUiPause);
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);

    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]),
      1,
      "dsAlarmLight shold be 1"
    );
    var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();
    await meteoBoxerActions.switchLightOff();
    await driver.sleep(waitUiPause * 2);
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) < luminosityThreshold, "Luminosity should be less than luminosityThreshold");
    await meteoBoxerActions.switchLightOn();
    await driver.sleep(dataProcessingPause);
    assert((await meteoBoxerActions.getLuminosity()) > luminosityThreshold, "Luminosity should be less than luminosityThreshold");

    var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

    assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");
    assert.equal(
      await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]),
      1,
      "dsAlarmLight shold be 1"
    );
    console.log("---------“Date and time” change every time the light is turned on, but  active “Alarm light” keeps on the same---------");
  }).timeout(100000);

  it.only(
    "Test12 - Meteo_Boxer - Check “Date and time” change every time after do Move, but  active “Alarm light” keeps on the same",
    async function () {
      await commonActions.switchToDevice(deviceUnderTestingConfig);
      await driver.sleep(waitUiPause);
      await meteoBoxerActions.switchActivateDetectionState(true);
      await driver.sleep(waitUiPause);
      await meteoBoxerActions.doMove();
      await driver.sleep(dataProcessingPause);
      assert.equal(
        await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]),
        1,
        "dsAlarmMove shold be 1"
      );
      var previousLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

      await meteoBoxerActions.doMove();
      await driver.sleep(dataProcessingPause);
      var lastLightDetectionTime = await meteoBoxerActions.getAlarmDetectionTime();

      assert.notEqual(previousLightDetectionTime["lastAlarmDetectionTime"], lastLightDetectionTime["lastAlarmDetectionTime"], "Time MUST changed");
      assert.equal(
        await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]),
        1,
        "dsAlarmMove shold be 1"
      );
      console.log("---------“Date and time” change every time after do Move, but  active “Alarm light” keeps on the same---------");
    }
  ).timeout(100000);
});
