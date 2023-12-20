const { Builder, By, Key } = require("selenium-webdriver");
var PropertiesReader = require("properties-reader");
var blynkProperties = PropertiesReader("../blynk.properties");

exports.login = async function () {
  try {
    await driver.findElement(By.xpath("//span[text()='Go to Web Console']")).click();
  } catch {}
  await driver.findElement(By.xpath('//*[@id="email"]')).click();
  await driver.findElement(By.id("email")).sendKeys(blynkProperties.get("login"));
  await driver.findElement(By.xpath('//*[@id="password"]')).click();
  await driver.findElement(By.id("password")).sendKeys(blynkProperties.get("password"));
  await driver.findElement(By.xpath("//button[@type='submit']")).click();
  await driver.sleep(waitUiPause);
  await driver.findElement(By.xpath("//div[contains(@class,'user-layout__news-tooltip-wrapper')]")).click();
  console.log("login is done");
};

exports.switchToDevice = async function (deviceConfig) {
  var currentDeviceName;
  try {
    currentDeviceName = await driver.findElement(By.xpath("//div[@class='content-editable-input']")).getText();
  } catch {}
  // console.log("Current device name: %s, needed device name: %s",currentDeviceName, deviceConfig["deviceName"]);
  if (currentDeviceName == deviceConfig["deviceName"]) {
    driver.navigate().refresh();
  } else {
    await driver.get("https://blynk.cloud/dashboard");
    await driver.sleep(waitUiPause);
    try {
      await driver.findElement(By.xpath("//div[text()='" + deviceConfig["deviceName"] + "']")).click();
    } catch {
      await driver.sleep(waitUiPause);
      await driver.findElement(By.xpath("//div[text()='" + deviceConfig["deviceName"] + "']")).click();
    }
  }
  console.log("Switch to '%s' is done", deviceConfig["deviceName"]);
};

exports.getSystemTime = function () {
  let result = {};
  var date = new Date();
  result["systemTime"] = String(date.getHours()) + ":" + String(date.getMinutes()) + ":" + String(date.getSeconds());
  result["systemHours"] = date.getHours();
  result["systemMinutes"] = date.getMinutes();
  result["systemSeconds"] = date.getSeconds();
  // result["systemTimeZone"] = date.getCurrentTimeOffSet();
  console.log("getSystemTime output: ", result);
  return result;
};

exports.waitForNewMinuteIfSecondsMore = async function (seconds) {
  var systemSeconds = new Date().getSeconds();
  while (systemSeconds > seconds) {
    await driver.sleep(waitUiPause);
    console.log("systemSeconds: %d -> wait 1 sec", systemSeconds);
    systemSeconds = new Date().getSeconds();
  }
  await driver.sleep(waitUiPause);
};

exports.waitForNeededMinutes = async function (minutes) {
  console.log("Waiting for minutes = %d", minutes);
  do {
    var systemMinutes = new Date().getMinutes();
    await driver.sleep(waitUiPause * 10);
    console.log("systemMinutes: %d -> wait 10 sec", systemMinutes);
  } while (systemMinutes != minutes);
  console.log("waitForNeededMinutes: finished");
}

exports.getDataStreamValue = async function (deviceToken, dataStreamId) {
  await driver.get("https://fra1.blynk.cloud/external/api/get?token=" + deviceToken + "&" + dataStreamId);
  var value = await driver.findElement(By.xpath("//pre")).getText();
  console.log("getDataStreamValue: dataStreamId = %s; value = %s", dataStreamId, value);
  return value;
};

exports.getDataStreamValue2 = async function (deviceConfig, dataStreamId) {
  await driver.get("https://fra1.blynk.cloud/external/api/get?token=" + deviceConfig["deviceToken"] + "&" + dataStreamId);
  var value = await driver.findElement(By.xpath("//pre")).getText();
  console.log("getDataStreamValue for device '%s': dataStreamId = %s; value = %s", deviceConfig["deviceName"], dataStreamId, value);
  return value;
};

exports.setDataStreamValue = async function (deviceToken, dataStreamId, newValue) {
  await driver.get("https://fra1.blynk.cloud/external/api/update?token=" + deviceToken + "&" + dataStreamId + "=" + newValue);
  console.log("setDataStreamValue: dataStreamId = %s; newValue = %s", dataStreamId, newValue);
};

exports.setDataStreamValue2 = async function (deviceConfig, dataStreamId, newValue) {
  await driver.get("https://fra1.blynk.cloud/external/api/update?token=" + deviceConfig["deviceToken"] + "&" + dataStreamId + "=" + newValue);
  console.log("setDataStreamValue for device '%s': dataStreamId = %s; newValue = %s", deviceConfig["deviceName"], dataStreamId, newValue);
};

exports.isDeviceOnline = async function (deviceConfig) {
  await this.switchToDevice(deviceConfig);
  await driver.sleep(waitUiPause);
  var isDeviceOnline = (await driver.findElement(By.xpath("//span[contains(@class, 'device-status-tag')]")).getText()) == "Online";
  console.log("isDeviceOnline for '%s' is %s", deviceConfig["deviceName"], isDeviceOnline);
  return isDeviceOnline;
};

exports.switchPower = async function (requiredSwitchState) {
  var switchState = !parseInt(await this.getDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher1"]));

  if (switchState != requiredSwitchState) {
    await this.switchToDevice(doubleSwitcherConfig);
    await driver.sleep(waitUiPause);
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button[@role='switch']")).click();
    await driver.sleep(waitUiPause);
  }
  console.log("--- switchPower: switchState = %s ---", requiredSwitchState ? "On" : "Off");
};

//TODO move to aquarium
exports.switchWaterLevel = async function (requiredSwitchWaterLevel) {
  var switchWaterLevel = !parseInt(await this.getDataStreamValue2(doubleSwitcherConfig, doubleSwitcherTemplate["switcher2"]));

  if (switchWaterLevel != requiredSwitchWaterLevel) {
    await this.switchToDevice(doubleSwitcherConfig);
    await driver.sleep(waitUiPause);
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH3']//button[@role='switch']")).click();
    await driver.sleep(waitUiPause);
  }
  console.log("--- switchWaterLevel: switchWaterLevel = %s ---", requiredSwitchWaterLevel ? "On" : "Off");
};

exports.waitDeviceOnlineState = async function (deviceConfig, OnlineState, waitInterval) {
  while ((await this.isDeviceOnline(deviceConfig)) != OnlineState) {
    console.log("Waiting for %d seconds", waitInterval);
    await driver.sleep(waitInterval * 1000);
  }
  console.log("--- Device '%s' is %s ---", deviceConfig["deviceName"], OnlineState ? "Online" : "Offline");
};

exports.switchDeviceOn = async function (deviceConfig) {
  await this.switchPower(true);
  await driver.sleep(waitUiPause);
  await this.waitDeviceOnlineState(deviceConfig, true, 2);
};

// ------------------- Time zone -----------------------------

exports.getCurrentDeviceTimeOffSet = async function (deviceConfig, deviceTemplate) {
  var currentTimeOffSet = parseInt(await this.getDataStreamValue2(deviceConfig, deviceTemplate["dsTimeOffSet"]));
  return currentTimeOffSet;
};

exports.setDeviceTimeOffSet = async function (deviceConfig, deviceTemplate, timeOffset) {
  await this.setDataStreamValue2(deviceConfig, deviceTemplate["dsTimeOffSet"], timeOffset);
};

exports.getSystemTimeZone = function () {
  return this.getTimeOffSetForNeedeedHours(new Date().getHours());
};

exports.getTimeOffSetForNeedeedHours = function (neededHours) {
  var grinvichHours = new Date().getUTCHours();
  timeOffSet = neededHours - grinvichHours;
  if (timeOffSet > 12) {
    timeOffSet = timeOffSet - 24;
  } else if (timeOffSet < -12) {
    timeOffSet = timeOffSet + 24;
  }
  console.log("getTimeOffSetForNeedeedHours: timeOffSet = %d", timeOffSet);
  return timeOffSet;
};

exports.setTimeOffSetForNeedeedHours = async function (deviceConfig, deviceTemplate, neededHours) {
  // var timeOffSet = this.getTimeOffSetForNeedeedHours(neededHours);
  // console.log("setTimeOffSetForNeedeedHours: timeOffSet = %d", timeOffSet);
  await this.setDeviceTimeOffSet(deviceConfig, deviceTemplate, this.getTimeOffSetForNeedeedHours(neededHours));
};
