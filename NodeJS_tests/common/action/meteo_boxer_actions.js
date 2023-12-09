var chai = require("chai");
var assert = chai.assert;
const { Builder, By, Key } = require("selenium-webdriver");
var commonActions = require("./common_actions.js");


exports.getCurrentActivateDetectionState = async function () {
  return parseInt(
    await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsActivateDetection"]
    )
  );
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
  console.log(
    "--- switchActivateDetectionState: switchActivateDetectionState = %s ---",
    requireActivateDetectionState ? "On" : "Off"
  );
};

exports.doMove = async function () {
  await commonActions.switchPower(true);
  await driver.sleep(waitUiPause);
  await commonActions.switchPower(false);
};

exports.getLastAlarmDetection = async function () {
  let result = {};
  // result["lastAlarmDetectionTime"] = await driver.findElement(By.xpath("//div[@id='WEB_LABEL3']//span")).getText();
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

