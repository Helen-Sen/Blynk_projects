var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");
var currentPumpModeNumber;

//describe - describes test
describe("Aquarium-Test - check pump", function () {
  this.timeout(1000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();

    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.switchDeviceOn(deviceUnderTestingConfig);
    }
    // currentPumpMode = await aquariumActions.getPumpModeThroughUI();
    currentPumpModeNumber = parseInt(
      await commonActions.getDataStreamValue(
        deviceUnderTestingConfig["deviceToken"],
        deviceUnderTestingTemplate["dsPumpMode"]
      )
    );
    console.log("END BEFORE");
  });

  after(async function () {
    // await driver.quit();
    console.log("END AFTER");
  });

  //it - describes expected behaviour
  it("Aquarium-Test should check in Auto mode the pump turns On when the water level is low (Through UI)", async function () {
    var currentPumpMode = await aquariumActions.getPumpModeThroughUI();
    if (currentPumpMode != "Auto") {
      await aquariumActions.switchPumpModeAutoThroughUI();
    }
    await driver.sleep(waitUiPause);
    await commonActions.switchWaterLevel(false);
    await driver.sleep(dataProcessingPause);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await aquariumActions.checkPumpLed(true);
    await driver.sleep(waitUiPause);
  }).timeout(300000);

it("Aquarium-Test should check in Auto mode the pump turns On when the water level is low", async function () {
  var currentPumpMode = await aquariumActions.getPumpModeThroughUI();
  if (currentPumpMode != "Auto") {
    await aquariumActions.switchPumpModeAutoThroughUI();
  }
  await driver.sleep(waitUiPause);
  await commonActions.switchWaterLevel(false);
  await driver.sleep(dataProcessingPause);
  await commonActions.switchToDevice(deviceUnderTestingConfig);
  await driver.sleep(waitUiPause);
  await aquariumActions.checkPumpLed(true);
  await driver.sleep(waitUiPause);
}).timeout(300000);









  it("Aquarium-Test should check in Auto mode the pump turns Off when the water level is normal (Through UI)", async function () {
    var currentPumpMode = await aquariumActions.getPumpModeThroughUI();
    if (currentPumpMode != "Auto") {
      await aquariumActions.switchPumpModeAutoThroughUI();
    }
    await driver.sleep(waitUiPause);
    await commonActions.switchWaterLevel(true);
    await driver.sleep(dataProcessingPause);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);

    await aquariumActions.checkPumpLed(false);
    await driver.sleep(waitUiPause);
  }).timeout(300000);
});
