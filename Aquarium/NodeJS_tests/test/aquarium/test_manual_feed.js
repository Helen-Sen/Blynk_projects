var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");

const waitUiPause = 1000;
const waitFeedPause = 7000;

//describe - describes test
describe("Aquarium - manual feed", function () {
  this.timeout(1000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    console.log("END BEFORE");
  });

  after(async function () {
    await driver.quit();
    console.log("END AFTER");
  });

  //it - describes expected behaviour
  it("Aquarium should do manual feed", async function () {
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfNeeded();
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