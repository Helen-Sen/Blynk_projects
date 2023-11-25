const { Builder, By, Key } = require("selenium-webdriver");
driver = new Builder().forBrowser("chrome").build();

exports.login = async function() {
  console.log("login - start");
  // await driver.get("https://blynk.cloud/dashboard/login");
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
}

exports.switchToDevice = async function(deviceConfig) {
  await driver.get("https://blynk.cloud/dashboard");
  await driver.sleep(1000);
  await driver.findElement(By.xpath("//div[text()='" + deviceConfig["deviceName"] + "']")).click();
  console.log("Switch to " + deviceConfig["deviceName"] + " is done");
}

exports.doFeed = async function() {
  let vars = {};
  vars["feedState"] = await driver.findElement(By.xpath("//div[@id=\'WEB_SWITCH1\']//span[contains(@class, \'label\')]")).getText()
  console.log("feedState = " + vars["feedState"]);
  if (!!await driver.executeScript("return (arguments[0]==\"Done\")", vars["feedState"])) {
    await driver.findElement(By.xpath("//div[@id=\'WEB_SWITCH1\']//button")).click()
    await driver.sleep(1000)
  }
  await driver.findElement(By.xpath("//div[@id=\'WEB_SWITCH1\']//button")).click()
}
