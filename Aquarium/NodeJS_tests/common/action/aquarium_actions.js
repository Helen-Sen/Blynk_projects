const { Builder, By, Key } = require("selenium-webdriver");

exports.doFeed = async function () {
  var feedState = await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]")).getText();
  console.log("feedState = " + feedState);
  if (feedState == "Done") {
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
    await driver.sleep(1000);
  }
  await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
};

exports.getLastFeedTime = async function () {
  let vars = {};
  vars["lastFeedDateTime"] = await driver.findElement(By.xpath("//div[@id='WEB_LABEL2']//span")).getText();
  vars["lastFeedHours"] = parseInt(vars["lastFeedDateTime"].split(":")[0], 10);
  vars["lastFeedMinutes"] = parseInt(vars["lastFeedDateTime"].split(":")[1], 10);
  console.log(vars);
  return vars;
};
