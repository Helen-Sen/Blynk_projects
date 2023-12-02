var chai = require("chai");
var assert = chai.assert;
const { Builder, By, Key } = require("selenium-webdriver");

exports.doFeed = async function () {
  var feedState = await driver
    .findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]"))
    .getText();
  // console.log("feedState = " + feedState);
  if (feedState == "Done") {
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
    await driver.sleep(waitUiPause);
  }
  await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
  console.log("--- Feed is done ---");
};

exports.resetFeedState = async function () {
  var feedState = await driver
    .findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]"))
    .getText();
  console.log("feedState = %s", feedState);
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

exports.checkLedLight = async function (expLS) {
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
