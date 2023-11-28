var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");

var currentLightOnHours;
var currentLightOffHours;

//describe - describes test
describe("Aquarium-Test - check light", function () {
  //it - describes expected behaviour
  it("Aquarium-Test should check light is On", async function () {
    try {
      await driver.get("https://blynk.cloud/dashboard/login");
      await driver.sleep(1000);
      await commonActions.login();

      // await saveDataStreamValuesForLight();

      // var expectedLightState = true;
      // await setDataStreamsForLightOn();

      // await driver.sleep(12000);

      // await assertLuminosityByExpectedLightState(expectedLightState);

      // await commonActions.switchToDevice(deviceUnderTestingConfig);
      // await driver.sleep(1000);
      // await aquariumActions.checkLedLight(expectedLightState);
      // await driver.sleep(1000);

      // console.log("TEST PASSED");
    } finally {
      // await restoreDataStreamValuesForLight();
      // await driver.quit();
    }
  }).timeout(100000);

  // it("Aquarium-Test should check light is Off", async function () {
  //   try {
  //     await saveDataStreamValuesForLight();

  //     var expectedLightState = false;
  //     await setDataStreamsForLightOff();

  //     await driver.sleep(12000);

  //     await assertLuminosityByExpectedLightState(expectedLightState);

  //     await commonActions.switchToDevice(deviceUnderTestingConfig);
  //     await driver.sleep(1000);
  //     await aquariumActions.checkLedLight(expectedLightState);
  //     await driver.sleep(1000);

  //     console.log("TEST PASSED");
  //   } finally {
  //     await restoreDataStreamValuesForLight();
  //     // await driver.quit();
  //   }
  // }).timeout(100000);

  it("Aquarium-Test should check light is On after power outage", async function () {
    try {
      // await saveDataStreamValuesForLight();

      // var expectedLightState = true;

      // await setDataStreamsForLightOn();

      // await driver.sleep(12000);

      // await assertLuminosityByExpectedLightState(expectedLightState);

      // await commonActions.switchToDevice(deviceUnderTestingConfig);
      // await driver.sleep(1000);
      // await aquariumActions.checkLedLight(expectedLightState);
      await driver.sleep(1000);

      await commonActions.switchToDevice(doubleSwitcherConfig);

      await driver.sleep(1000);

      var isDoubleSwitcherOnline = await commonActions.isDeviceOnline(doubleSwitcherConfig);
      assert.isTrue(isDoubleSwitcherOnline, "DoubleSwitcher is Offline");

      await commonActions.doPowerOutage(deviceUnderTestingConfig);
      // var switchState = parseInt(
      //   await commonActions.getDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"])
      // );
      // console.log("switchState = %d", switchState);
      await driver.sleep(10000);

      console.log("TEST PASSED");
    } finally {
      // await restoreDataStreamValuesForLight();
      await driver.quit();
    }
  }).timeout(1000000);
});

async function saveDataStreamValuesForLight() {
  currentLightOnHours = parseInt(
    await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsLightOnHours"]
    )
  );
  await driver.sleep(1000);
  currentLightOffHours = parseInt(
    await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsLightOffHours"]
    )
  );
  await driver.sleep(1000);
}

async function restoreDataStreamValuesForLight() {
  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsLightOnHours"],
    currentLightOnHours
  );
  await driver.sleep(1000);
  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsLightOffHours"],
    currentLightOffHours
  );
  await driver.sleep(1000);
}

async function setDataStreamsForLightOn() {
  await setDataStreamsForLight(true);
}

async function setDataStreamsForLightOff() {
  await setDataStreamsForLight(false);
}

async function setDataStreamsForLight(shouldOn) {
  var systemHours = commonActions.getSystemTime()["systemHours"];

  if (shouldOn === false) systemHours = systemHours - 1;
  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsLightOnHours"],
    systemHours
  );
  await driver.sleep(1000);
  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsLightOffHours"],
    systemHours + 1
  );
  await driver.sleep(1000);
}

async function getLuminosity() {
  var sensorData = await commonActions.getDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsSensorData"]
  );
  await driver.sleep(1000);

  var luminosity = parseInt(sensorData.split("-")[0].match(/\d+/), 10);
  console.log("luminosity = %d", luminosity);

  return luminosity;
}

async function assertLuminosityByExpectedLightState(expectedLightState) {
  var luminosity = await getLuminosity();
  var luminosityThreshold = deviceUnderTestingConfig["luminosityThreshold"];
  var luminosityIncreasingWithLight = deviceUnderTestingConfig["luminosityIncreasingWithLight"];

  console.log("luminosityThreshold = %d", luminosityThreshold);

  // var actualLightState = luminosity > luminosityThreshold;
  // if (!luminosityIncreasingWithLight) {
  //   actualLightState = !actualLightState;
  // };

  var actualLightState = luminosityIncreasingWithLight
    ? luminosity > luminosityThreshold
    : !(luminosity > luminosityThreshold);

  console.log("actualLightState = ", actualLightState);
  assert.equal(actualLightState, expectedLightState, "Light state is wrong");
}
