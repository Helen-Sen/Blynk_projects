const { Builder, By, Key } = require("selenium-webdriver");

exports.login = async function () {
  try {
    await driver.findElement(By.xpath("//span[text()='Go to Web Console']")).click();
  } catch {}
  await driver.findElement(By.xpath('//*[@id="email"]')).click();
  await driver.findElement(By.id("email")).sendKeys("i.miflig@gmail.com");
  await driver.findElement(By.xpath('//*[@id="password"]')).click();
  await driver.findElement(By.id("password")).sendKeys("Cat-12345");
  await driver.findElement(By.xpath("//button[@type='submit']")).click();
  await driver.sleep(2000);
  await driver.findElement(By.xpath("//div[contains(@class,'user-layout__news-tooltip-wrapper')]")).click();
  console.log("login is done");
};

exports.switchToDevice = async function (deviceConfig) {
  try {
    var currentDeviceName = await driver.findElement(By.xpath("//div[@class='content-editable-input']")).getText();
    if (currentDeviceName == deviceConfig["deviceName"]) {
      driver.navigate().refresh();
      return;
    }
  } catch {}

  await driver.get("https://blynk.cloud/dashboard");
  await driver.sleep(1000);
  await driver.findElement(By.xpath("//div[text()='" + deviceConfig["deviceName"] + "']")).click();

  console.log("Switch to %s is done", deviceConfig["deviceName"]);
};

exports.getSystemTime = function () {
  let result = {};
  var date = new Date();
  result["systemTime"] = String(date.getHours()) + ":" + String(date.getMinutes()) + ":" + String(date.getSeconds());
  result["systemHours"] = date.getHours();
  result["systemMinutes"] = date.getMinutes();
  console.log("getSystemTime output: ", result);
  return result;
};

exports.waitForNewMinuteIfNeeded = async function () {
  var systemSeconds = new Date().getSeconds();
  while (systemSeconds > 45) {
    await driver.sleep(1000);
    console.log("systemSeconds: %d -> wait 1 sec", systemSeconds);
    systemSeconds = new Date().getSeconds();
  }
};

exports.getDataStreamValue = async function (deviceToken, dataStreamId) {
  await driver.get("https://fra1.blynk.cloud/external/api/get?token=" + deviceToken + "&" + dataStreamId);
  var value = await driver.findElement(By.xpath("//pre")).getText();
  console.log("getDataStreamValue: dataStreamId = %s; value = %s", dataStreamId, value);
  return value;
};

exports.setDataStreamValue = async function (deviceToken, dataStreamId, newValue) {
  await driver.get(
    "https://fra1.blynk.cloud/external/api/update?token=" + deviceToken + "&" + dataStreamId + "=" + newValue
  );
  console.log("setDataStreamValue: dataStreamId = %s; newValue = %s", dataStreamId, newValue);
};

exports.isDeviceOnline = async function (deviceConfig) {
  await this.switchToDevice(deviceConfig);
  await driver.sleep(1000);
  var isDeviceOnline =
    (await driver.findElement(By.xpath("//span[contains(@class, 'device-status-tag')]")).getText()) == "Online";
  console.log("isDeviceOnline for %s is %s", deviceConfig["deviceName"], isDeviceOnline);
  return isDeviceOnline;
};

exports.switchPower = async function (requiredSwitchState) {
  var switchState = !parseInt(
    await this.getDataStreamValue(doubleSwitcherConfig["deviceToken"], doubleSwitcherTemplate["switcher1"])
  );
  console.log("switchState = %s", switchState);

  if (switchState != requiredSwitchState) {
    await this.switchToDevice(doubleSwitcherConfig);
    await driver.sleep(1000);
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button[@role='switch']")).click();
  }
};

exports.doPowerOutage = async function (deviceConfig) {
  await this.switchPower(false);
  var pause = 10;
  while (await this.isDeviceOnline(deviceConfig)) {
    console.log("Waiting for %d seconds", pause);
    await driver.sleep(pause * 1000);
  }
  console.log("Device %s is Offline", deviceConfig["deviceName"]);
};
