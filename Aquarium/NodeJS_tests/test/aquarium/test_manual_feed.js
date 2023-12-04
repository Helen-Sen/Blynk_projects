var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");

//describe - describes test
describe("Aquarium - manual feed", function () {
  this.timeout(1000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    await driver.sleep(waitUiPause);
    currentTimeOffSet = await commonActions.getCurrentDeviceTimeOffSet(
      deviceUnderTestingConfig,
      deviceUnderTestingTemplate
    );
    console.log("END BEFORE");
  });

  after(async function () {
    
     await commonActions.setDataStreamValue(
       deviceUnderTestingConfig["deviceToken"],
       deviceUnderTestingTemplate["dsTimeOffSet"],
       currentTimeOffSet
    );
    await driver.quit();
    console.log("END AFTER");
  });

  //it - describes expected behaviour

  it("Aquarium should do manual feed", async function () {
    var systemTimeZone = commonActions.getSystemTimeZone();
    await commonActions.setDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsTimeOffSet"],
      systemTimeZone
    );

    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.switchDeviceOn(deviceUnderTestingConfig);
    }
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await aquariumActions.doFeed();
    await driver.sleep(waitFeedPause);
    var systemTime = commonActions.getSystemTime();
    await driver.sleep(5000);
    var lastfeed = await aquariumActions.getLastFeedTime();
    var lastFeedHours = lastfeed["lastFeedHours"];
    var lastFeedMinutes = lastfeed["lastFeedMinutes"];

    var systemHours = systemTime["systemHours"];
    var systemMinutes = systemTime["systemMinutes"];

    assert.equal(lastFeedHours, systemHours, "Feed hours not match with system hours");
    assert.equal(lastFeedMinutes, systemMinutes, "Feed minutes not match with system minutes");

    console.log("TEST PASSED");
  }).timeout(100000);
});
