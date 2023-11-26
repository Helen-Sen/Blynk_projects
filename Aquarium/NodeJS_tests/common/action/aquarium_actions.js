const { Builder, By, Key } = require("selenium-webdriver");

exports.doFeed = async function () {
  var feedState = await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//span[contains(@class, 'label')]")).getText();
  // console.log("feedState = " + feedState);
  if (feedState == "Done") {
    await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
    await driver.sleep(1000);
  }
  await driver.findElement(By.xpath("//div[@id='WEB_SWITCH1']//button")).click();
};

exports.getLastFeedTime = async function () {
  let result = {};
  result["lastFeedDateTime"] = await driver.findElement(By.xpath("//div[@id='WEB_LABEL2']//span")).getText();
  result["lastFeedHours"] = parseInt(result["lastFeedDateTime"].split(":")[0], 10);
  result["lastFeedMinutes"] = parseInt(result["lastFeedDateTime"].split(":")[1], 10);
  console.log("getLastFeedTime output: ", result);
  return result;
};
