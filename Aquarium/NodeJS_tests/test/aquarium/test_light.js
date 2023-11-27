var chai = require("chai");
var path = require('path');

var assert = chai.assert;
require("../../common/main_objects.js");

// Test config
const testFileName = path.basename(__filename, path.extname(__filename))
var envUnderTesting = process.env.npm_config_envName;
console.log("--- Start running %s for %s environment ---", testFileName, envUnderTesting);
var testConfigs = require("../../common/config/test_config.js").getTestConfigs();
var testConfig = testConfigs[testFileName + "-" + envUnderTesting];
var deviceUnderTestingConfig = testConfig["deviceConfig"];
var deviceUnderTestingTemplate = testConfig["templateConfig"];

var commonActions = require("../../common/action/common_actions.js");
var aquarium = require("../../common/action/aquarium_actions.js");

var currentLightOnHours;
var currentLightOffHours;


//describe - describes test
describe("Aquarium-Test - check light", function () {
  //it - describes expected behaviour
  it("Aquarium-Test should check light is Off", async function () {
    try {
      await driver.get("https://blynk.cloud/dashboard/login");
      await driver.sleep(1000);
      await commonActions.login();

      await saveDataStreamValuesForLight();

      // var sensorData = await commonActions.getDataStreamValue(
      //   deviceUnderTestingConfig["deviceToken"],
      //   deviceUnderTestingTemplate["dsSensorData"]
      // );

      // await driver.sleep(1000);
      await setDataStreamsForLightOff();
      await driver.sleep(5000);

      // await commonActions.switchToDevice(deviceUnderTestingConfig);
      // await driver.sleep(2000);

      await restoreDataStreamValuesForLight();

      console.log("TEST PASSED");
    } finally {
      await driver.sleep(1000);
      // await driver.quit();
    }
  }).timeout(100000);

  it("Aquarium-Test should check light is On", async function () {
    try {
      await saveDataStreamValuesForLight();
      // await driver.sleep(1000);
      await setDataStreamsForLightOn();
      await driver.sleep(5000);

      // await commonActions.switchToDevice(deviceUnderTestingConfig);
      // await driver.sleep(2000);

      await restoreDataStreamValuesForLight();

      console.log("TEST PASSED");
    } finally {
      await driver.sleep(1000);
      await driver.quit();
    }
  }).timeout(100000);
});

async function saveDataStreamValuesForLight() {
  currentLightOnHours = parseInt(
    await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsLightOnHours"])
  );
  await driver.sleep(1000);
  currentLightOffHours = parseInt(
    await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsLightOffHours"])
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
