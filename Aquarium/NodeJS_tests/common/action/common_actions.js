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
  await driver.get("https://blynk.cloud/dashboard");
  await driver.sleep(1000);
  await driver.findElement(By.xpath("//div[text()='" + deviceConfig["deviceName"] + "']")).click();
  console.log("Switch to " + deviceConfig["deviceName"] + " is done");
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
    console.log("systemSeconds: " + systemSeconds + " -> wait 1 sec");
    systemSeconds = new Date().getSeconds();
  }
};

exports.getDataStreamValue = async function (deviceToken, dataStreamId) {
  await driver.get("https://fra1.blynk.cloud/external/api/get?token=" + deviceToken + "&" + dataStreamId);
  var result = await driver.findElement(By.xpath("//pre")).getText();
  console.log("getDataStreamValue: " + result);
  // result["lastFeedHours"] = parseInt(result["lastFeedDateTime"].split(":")[0], 10);
  return result;
};

exports.setDataStreamValue = async function (deviceToken, dataStreamId, newValue) {
  await driver.get(
    "https://fra1.blynk.cloud/external/api/update?token=" + deviceToken + "&" + dataStreamId + "=" + newValue
  );
};
