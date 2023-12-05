var chai = require("chai");
var assert = chai.assert;
const { Builder, By, Key } = require("selenium-webdriver");
var commonActions = require("./common_actions.js");

exports.getCurrentFeedState = async function () {
  var feedState = await driver
    .findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]"))
    .getText();
  console.log("feedState = %s", feedState);
  return feedState;
};

exports.doFeed = async function () {
  var feedState = await this.getCurrentFeedState();
  // var feedState = await driver
  //   .findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]"))
  //   .getText();
  // // console.log("feedState = " + feedState);
  if (feedState == "Done") {
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
    await driver.sleep(waitUiPause);
  }
  await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
  console.log("--- Feed is done ---");
};

exports.resetFeedState = async function () {
  var feedState = await this.getCurrentFeedState();
  // var feedState = await driver
  //   .findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]"))
  //   .getText();
  // console.log("feedState = %s", feedState);
  if (feedState == "Done") {
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
    await driver.sleep(waitUiPause);
  }
};

exports.getLastFeedTime = async function () {
  let result = {};
  result["lastFeedDateTime"] = await driver.findElement(By.xpath("//div[@id='WEB_LABEL2']//span")).getText();
  result["lastFeedHours"] = parseInt(result["lastFeedDateTime"].split(":")[0], 10);
  result["lastFeedMinutes"] = parseInt(result["lastFeedDateTime"].split(":")[1], 10);
  console.log("getLastFeedTime output: ", result);
  return result;
};

exports.checkLightLed = async function (expLS) {
  var ledColorStyle = await driver
    .findElement(By.xpath("//*[@id='WEB_LED7']//div[contains(@style, 'fill:')]"))
    .getAttribute("style");
  console.log("ledColor = %s", ledColorStyle);
  var lightIsOnColorStyle = "rgb(250, 219, 20)";
  var lightIsOffColorStyle = "rgba(250, 219, 20, 0)";

  if (expLS == true) {
    assert.include(ledColorStyle, lightIsOnColorStyle, "ledColorStyle not include lightIsOnColorStyle");
    console.log("Led light is On");
  } else {
    assert.include(ledColorStyle, lightIsOffColorStyle, "ledColorStyle not include lightIsOffColorStyle");
    console.log("Led light is Off");
  }
};

// -----------------Pump---------------------------

exports.getPumpModeThroughUI = async function () {
  var pumpMode;
  var pumpModeNumber = await driver
    .findElement(By.xpath("//*[@id='WEB_SLIDER8']//div[contains(@class, 'value--value')]"))
    .getText();
  if (pumpModeNumber == "0") {
    pumpMode = "Off";
  } else if (pumpModeNumber == "1") {
    pumpMode = "Auto";
  } else {
    pumpMode = "On";
  }
  console.log("pumpModeNumber = %s", pumpModeNumber);
  console.log("pumpMode = %s", pumpMode);
  return pumpMode;
};

exports.getPumpMode = async function () {
  var pumpMode;
  var pumpModeNumber = await commonActions.getDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsPumpMode"]
  );
  if (pumpModeNumber == "0") {
    pumpMode = "Off";
  } else if (pumpModeNumber == "1") {
    pumpMode = "Auto";
  } else {
    pumpMode = "On";
  }
  console.log("pumpModeNumber = %s", pumpModeNumber);
  console.log("pumpMode = %s", pumpMode);
  return pumpMode;
};

exports.switchPumpModeAutoThroughUI = async function () {
  var pumpMode = await this.getPumpModeThroughUI();
  if (pumpMode == "Off") {
    await driver.findElement(By.xpath("//*[@id='WEB_SLIDER8']//span[@aria-label='plus']")).click();
    await driver.sleep(waitUiPause);
  } else if (pumpMode == "On") {
    await driver.findElement(By.xpath("//*[@id='WEB_SLIDER8']//span[@aria-label='minus']")).click();
    await driver.sleep(waitUiPause);
  }
  var newPumpMode = await this.getPumpMode();
  console.log("Pump mode after switch is = %s", newPumpMode);
};

exports.switchPumpMode = async function (pumpMode) {
  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsPumpMode"],
    pumpMode
  );
};

exports.switchPumpModeAuto = async function () {
  await this.switchPumpMode(1);
};

exports.switchPumpModeOn = async function () {
  await this.switchPumpMode(2);
};

exports.switchPumpModeOff = async function () {
  await this.switchPumpMode(0);
};

exports.checkPumpLed = async function (expectedPumpState) {
  var ledColorStyle = await driver
    .findElement(By.xpath("//*[@id='WEB_LED6']//div[contains(@style, 'fill:')]"))
    .getAttribute("style");
  console.log("ledPumpColor = %s", ledColorStyle);
  var pumpIsOnColorStyle = "rgb(0, 106, 217)";
  var pumpIsOffColorStyle = "rgba(0, 106, 217, 0)";

  if (expectedPumpState == true) {
    assert.include(ledColorStyle, pumpIsOnColorStyle, "ledColorStyle not include pumpIsOnColorStyle");
    console.log("Pump is On");
  } else {
    assert.include(ledColorStyle, pumpIsOffColorStyle, "ledColorStyle not include pumpIsOffColorStyle");
    console.log("Pump is Off");
  }
};



