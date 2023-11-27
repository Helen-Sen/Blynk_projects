var chai = require("chai");
var assert = chai.assert;

require("./common/main_objects.js");
var commonActions = require("./common/action/common_actions.js");
var aquarium = require("./common/action/aquarium_actions.js");
var devices = require("./common/config/devices.js");

//describe - describes test
describe("Aquarium-Test - check light", function () {
  //it - describes expected behaviour
  it("Aquarium-Test should check light is On", async function () {
    try {
      await driver.get("https://blynk.cloud/dashboard/login");
      await driver.sleep(1000);
      await commonActions.login();
      var aquariumTestConfig = devices.getAquariumTestConfig();

      var systemTime = commonActions.getSystemTime();
      var systemHours = systemTime["systemHours"];
      // var systemMinutes = systemTime["systemMinutes"];

      var aquariumTemplateConfig = devices.getAquariumTemplateConfig();

      var currentLightOnHours = parseInt(
        await commonActions.getDataStreamValue(
          aquariumTestConfig["deviceToken"],
          aquariumTemplateConfig["dsLightOnHours"]
        )
      );
      await driver.sleep(1000);
      var currentLightOffHours = parseInt(
        await commonActions.getDataStreamValue(
          aquariumTestConfig["deviceToken"],
          aquariumTemplateConfig["dsLightOffHours"]
        )
      );
      await driver.sleep(1000);

      var sensorData = await commonActions.getDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsSensorData"]
      );
      await driver.sleep(1000);

      await commonActions.setDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsLightOnHours"],
        systemHours
      );
      await driver.sleep(2000);
      await commonActions.setDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsLightOffHours"],
        systemHours + 1
      );
      await driver.sleep(3000);

      var expectedLightState = true;

      var luminosity = parseInt(sensorData.split("-")[0].match(/\d+/), 10);
      console.log("luminosity = %d", luminosity);

      var luminosityThreshold = devices.getAquariumTestConfig()["luminosityThreshold"];
      console.log("luminosityThreshold = %d", luminosityThreshold);
      if (luminosity < luminosityThreshold) {
        console.log("Light is On");
      } else {
        console.log("Light is Off");
      }

      await commonActions.switchToDevice(aquariumTestConfig);
      await driver.sleep(2000);

      await aquarium.checkLedLight(expectedLightState);
      await driver.sleep(2000);

      await commonActions.setDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsLightOnHours"],
        currentLightOnHours
      );
      await driver.sleep(1000);
      await commonActions.setDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsLightOffHours"],
        currentLightOffHours
      );
      await driver.sleep(1000);

      console.log("TEST PASSED");
    } finally {
      await driver.sleep(1000);
      await driver.quit();
    }
  }).timeout(100000);
});
