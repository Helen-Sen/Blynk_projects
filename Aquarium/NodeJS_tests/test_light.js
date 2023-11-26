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

      var currentLightOnHours = parseInt(await commonActions.getDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsLightOnHours"]
      ));
      console.log("currentLightOnHours", currentLightOnHours);
      await driver.sleep(2000);

      var sensorData = await commonActions.getDataStreamValue(
        aquariumTestConfig["deviceToken"], aquariumTemplateConfig["dsSensorData"]);
      console.log("sensorData", sensorData);
      await driver.sleep(2000);

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
      await driver.sleep(2000);
      // await commonActions.switchToDevice(aquariumTestConfig);
      // await driver.sleep(2000);

      await commonActions.setDataStreamValue(
        aquariumTestConfig["deviceToken"],
        aquariumTemplateConfig["dsLightOnHours"],
        currentLightOnHours + 1
      );
      await driver.sleep(2000);

      console.log("TEST PASSED");
    } finally {
      await driver.sleep(1000);
      await driver.quit();
    }
  }).timeout(100000);
});
