var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");

var currentLightOnHours;
var currentLightOffHours;

const waitLuminosityPause = 15000;
const waitUiPause = 1000;

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
      var requiredLightState = true;
      await saveDataStreamValuesForLight();
      await setDataStreamsForLight(requiredLightState);
      await driver.sleep(waitLuminosityPause);
      await assertLuminosityByExpectedLightState(requiredLightState);
      await commonActions.switchToDevice(deviceUnderTestingConfig);
      await driver.sleep(waitUiPause);
      await aquariumActions.checkLedLight(requiredLightState);
      await driver.sleep(waitUiPause);

      await commonActions.switchPower(false);
      await commonActions.waitDeviceOnlineState(deviceUnderTestingConfig, false, 10);

      await commonActions.switchPower(true);
      await driver.sleep(waitUiPause);
      await commonActions.waitDeviceOnlineState(deviceUnderTestingConfig, true, 2);
      await driver.sleep(waitLuminosityPause);
      await assertLuminosityByExpectedLightState(requiredLightState);
      await commonActions.switchToDevice(deviceUnderTestingConfig);
      await driver.sleep(waitUiPause);
      await aquariumActions.checkLedLight(requiredLightState);
      await driver.sleep(waitUiPause);
      console.log("TEST PASSED");
    } finally {
      await restoreDataStreamValuesForLight();
    }
  }).timeout(1000000);

  it("Aquarium-Test should check light is Off after power outage", async function () {
    try {
      var requiredLightState = false;
      await saveDataStreamValuesForLight();
      await setDataStreamsForLight(requiredLightState);
      await driver.sleep(waitLuminosityPause);
      await assertLuminosityByExpectedLightState(requiredLightState);
      await commonActions.switchToDevice(deviceUnderTestingConfig);
      await driver.sleep(waitUiPause);
      await aquariumActions.checkLedLight(requiredLightState);
      await driver.sleep(waitUiPause);

      await commonActions.switchPower(false);
      await commonActions.waitDeviceOnlineState(deviceUnderTestingConfig, false, 10);

      await commonActions.switchPower(true);
      await driver.sleep(waitUiPause);
      await commonActions.waitDeviceOnlineState(deviceUnderTestingConfig, true, 2);
      await driver.sleep(waitLuminosityPause);
      await assertLuminosityByExpectedLightState(requiredLightState);
      await commonActions.switchToDevice(deviceUnderTestingConfig);
      await driver.sleep(waitUiPause);
      await aquariumActions.checkLedLight(requiredLightState);
      await driver.sleep(waitUiPause);
      console.log("TEST PASSED");
    } finally {
      await restoreDataStreamValuesForLight();
      // await driver.quit();
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

  var actualLightState = luminosityIncreasingWithLight
    ? luminosity > luminosityThreshold
    : !(luminosity > luminosityThreshold);

  console.log("actualLightState = ", actualLightState);
  assert.equal(actualLightState, expectedLightState, "Light state is wrong");
}
