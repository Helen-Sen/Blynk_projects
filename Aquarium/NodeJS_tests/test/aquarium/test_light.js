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

      await saveDataStreamValuesForLight();

      var expectedLightState = true;
      await setDataStreamsForLightOn();

      await driver.sleep(10000);

      var luminosity = await getLuminosity();

      var luminosityThreshold = deviceUnderTestingConfig["luminosityThreshold"];
      console.log("luminosityThreshold = %d", luminosityThreshold);
      if (luminosity < luminosityThreshold) {
        console.log("Light is On");
      } else {
        console.log("Light is Off");
      }

      await commonActions.switchToDevice(deviceUnderTestingConfig);
      await driver.sleep(1000);
      await aquariumActions.checkLedLight(expectedLightState);
      await driver.sleep(1000);      

      console.log("TEST PASSED");
    } finally {
      await restoreDataStreamValuesForLight();
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
