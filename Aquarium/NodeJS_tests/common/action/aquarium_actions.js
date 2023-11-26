const { Builder, By, Key } = require("selenium-webdriver");

exports.doFeed = async function() {
  let vars = {};
  vars["feedState"] = await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]")).getText()
  console.log("feedState = " + vars["feedState"]);
  if (!!await driver.executeScript("return (arguments[0]=='Done')", vars["feedState"])) {
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click()
    await driver.sleep(1000)
  }
  await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click()
}
