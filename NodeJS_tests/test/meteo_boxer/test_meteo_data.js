var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var meteoBoxerActions = require("../../common/action/meteo_boxer_actions.js");

//describe - describes test
describe("Test1 - Meteo_Boxer - check meteodata", function () {
  this.timeout(1000000);
  before(async function () {
    console.log("--- BEFORE START ---");
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    console.log("--- BEFORE END ---");
  });

  after(async function () {
    console.log("--- AFTER START ---");
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
      await driver.sleep(waitUiPause);
      console.log("--- switch Light off after test ---");
    }
    console.log("--- AFTER EACH END ---");
  });

  //it - describes expected behaviour
  it("Meteo_Boxer - check meteodata", async function () {
    await commonActions.isDeviceOnline(deviceUnderTestingConfig);
    await driver.sleep(dataProcessingPause);

    await meteoBoxerActions.switchLightOn();
    await driver.sleep(waitUiPause);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(dataProcessingPause);

    var luminosity = await meteoBoxerActions.getLuminosity();
    currentLuminosityThreshold = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsLuminosityThreshold"]);
    console.log("currentLuminosityThreshold = %s", currentLuminosityThreshold);
    assert(luminosity > currentLuminosityThreshold, "Luminosity should be more then luminosityThreshold");
    await driver.sleep(waitUiPause);

    var temperature = await meteoBoxerActions.getTemperature();
    assert(temperature >= 20 && temperature <= 30, "Temperature should be between 20C and 30C");
    await driver.sleep(waitUiPause);

    var humidity = await meteoBoxerActions.getHumidity();
    assert(humidity >= 20 && humidity <= 60, "Humidity should be between 20C and 60C");
  }).timeout(100000);
});
