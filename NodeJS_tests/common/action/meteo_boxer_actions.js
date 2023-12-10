var chai = require("chai");
var assert = chai.assert;
const { Builder, By, Key } = require("selenium-webdriver");
var commonActions = require("./common_actions.js");

exports.getCurrentActivateDetectionState = async function () {
  return parseInt(await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsActivateDetection"]));
};

exports.switchActivateDetectionState = async function (requireActivateDetectionState) {
  var currentActivateDetectionState = await this.getCurrentActivateDetectionState();
  await commonActions.switchToDevice(deviceUnderTestingConfig);
  await driver.sleep(waitUiPause);
  console.log("currentActivateDetectionState = %s", currentActivateDetectionState);
  if (currentActivateDetectionState != requireActivateDetectionState) {
    await driver.findElement(By.xpath("//*[@id='WEB_SWITCH2']//button")).click();
    await driver.sleep(waitUiPause);
  }
  console.log("--- switchActivateDetectionState: switchActivateDetectionState = %s ---", requireActivateDetectionState ? "On" : "Off");
};

exports.doMove = async function () {
  await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"], 0);
  await driver.sleep(waitUiPause);
  await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"], 1);
};

exports.switchLightOn = async function () {
  await commonActions.setDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher2"], 0);
};

exports.getLastAlarmDetection = async function () {
  let result = {};
  result["lastAlarmDetectionTime"] = await commonActions.getDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsDateAndTime"]
  );
  result["lastAlarmDetectionHours"] = parseInt(result["lastAlarmDetectionTime"].split(":")[0], 10);
  result["lastAlarmDetectionMinutes"] = parseInt(result["lastAlarmDetectionTime"].split(":")[1], 10);
  result["lastAlarmDetectionSeconds"] = parseInt(result["lastAlarmDetectionTime"].split(":")[2], 10);
  console.log("getAlarmDetectionTime output: ", result);
  return result;
};

exports.getLuminosity = async function () {
  var generalData = await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsGeneralData"]);
  var luminosity = parseInt(generalData.split(":")[1], 10);
  // console.log("luminosity = %s", luminosity);
  return luminosity;
};
