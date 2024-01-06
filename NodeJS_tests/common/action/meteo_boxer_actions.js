var chai = require("chai");
var assert = chai.assert;
const { Builder, By, Key } = require("selenium-webdriver");
var commonActions = require("./common_actions.js");

exports.getCurrentActivateDetectionState = async function () {
  return parseInt(await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsActivateDetection"]));
};

exports.switchActivateDetectionState = async function (requireActivateDetectionState) {
  var currentActivateDetectionState = await this.getCurrentActivateDetectionState();
  await commonActions.switchToDevice(deviceUnderTestingConfig);
  await driver.sleep(waitUiPause);
  console.log("currentActivateDetectionState = %s", currentActivateDetectionState);
  if (currentActivateDetectionState != requireActivateDetectionState) {
    try {
      await driver.findElement(By.xpath("//*[@id='WEB_SWITCH2']//button")).click();
    } catch {
      await driver.sleep(waitUiPause);
      await driver.findElement(By.xpath("//*[@id='WEB_SWITCH2']//button")).click();
    }
  }
  console.log("--- switchActivateDetectionState: switchActivateDetectionState = %s ---", requireActivateDetectionState ? "On" : "Off");
};

exports.doMove = async function () {
  await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 0);
  await driver.sleep(waitUiPause);
  await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"], 1);
};

exports.switchLightOn = async function () {
  await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"], 0);
};

exports.switchLightOff = async function () {
  await commonActions.setDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"], 1);
};

exports.isLightOn = async function () {
  var isLightOn = !parseInt(await commonActions.getDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"]));
  console.log("isLightOn = %s", isLightOn);
  return isLightOn;
};

exports.getAlarmDetectionTime = async function () {
  let result = {};
  result["lastAlarmDetectionTime"] = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsDateAndTime"]);
  result["lastAlarmDetectionHours"] = parseInt(result["lastAlarmDetectionTime"].split(":")[0], 10);
  result["lastAlarmDetectionMinutes"] = parseInt(result["lastAlarmDetectionTime"].split(":")[1], 10);
  result["lastAlarmDetectionSeconds"] = parseInt(result["lastAlarmDetectionTime"].split(":")[2], 10);
  console.log("getAlarmDetectionTime output: ", result);
  return result;
};

exports.getLuminosity = async function () {
  var generalData = await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsGeneralData"]);
  var luminosity = parseInt(generalData.split(":")[1], 10);
  console.log("luminosity = %s", luminosity);
  return luminosity;
};

exports.getTemperature = async function () {
  var meteoData = await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsMeteoData"]);
  var temperature = parseInt(meteoData.split(":")[1], 10);
  console.log("temperature = %s", temperature);
  return temperature;
};

exports.getHumidity = async function () {
  var meteoData = await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsMeteoData"]);
  var humidity = parseInt(meteoData.split("-")[1].split(":")[1], 10);
  console.log("humidity = %s", humidity);
  return humidity;
};

exports.isAlarmMoveStateOn = async function () {
  var alarmMoveState = parseInt(await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmMove"]));
  console.log("alarmMoveState = %s", alarmMoveState ? "On" : "Off");
  return alarmMoveState;
};

exports.isAlarmLightStateOn = async function () {
  var alarmLigthState = parseInt(await commonActions.getDataStreamValue2(deviceUnderTestingConfig, deviceUnderTestingTemplate["dsAlarmLight"]));
  console.log("alarmLigthState = %s", alarmLigthState ? "On" : "Off");
  return alarmLigthState;
};
