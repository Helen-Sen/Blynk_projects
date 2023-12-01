var chai = require("chai");
var assert = chai.assert;

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");

const waitUiPause = 1000;
const waitFeedPause = 7000;

//describe - describes test
describe("Aquarium - scheduled feed", function () {
  this.timeout(1000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    console.log("END BEFORE");
  });

  after(async function () {
    // await driver.quit();
    console.log("END AFTER");
  });

  it("Aquarium should do scheduled feed", async function () {
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await setFeedTimeOneMinuteAhead();

    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.doDeviceOn(deviceUnderTestingConfig);
    }
    await driver.sleep(waitUiPause);
    await aquariumActions.resetFeedState();

    await waitingScheduledFeedTime();
    await commonActions.switchToDevice(deviceUnderTestingConfig);
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

  it("Aquarium should not feed on a schedule if feeding has already been done", async function () {
    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.doDeviceOn(deviceUnderTestingConfig);
    }
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await aquariumActions.doFeed();
    await driver.sleep(waitFeedPause);
    await setFeedTimeOneMinuteAhead();
    await waitingScheduledFeedTime();
    await driver.sleep(10000);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitFeedPause);
    await driver.sleep(5000);
    var lastfeed = await aquariumActions.getLastFeedTime();
    var lastFeedMinutes = lastfeed["lastFeedMinutes"];

    var systemTime = commonActions.getSystemTime();
    var systemMinutes = systemTime["systemMinutes"];

    assert.notEqual(lastFeedMinutes, systemMinutes, "Feed minutes match with system minutes");

    console.log("TEST PASSED");
  }).timeout(100000);

  it("Aquarium should do scheduled feed after power outage", async function () {
    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.doDeviceOn(deviceUnderTestingConfig);
    }
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await aquariumActions.doFeed();
    await driver.sleep(waitFeedPause);

    await setFeedTimeOneMinuteAhead();
    await waitingScheduledFeedTime();
    await driver.sleep(10000);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitFeedPause);
    await driver.sleep(5000);
    var lastfeed = await aquariumActions.getLastFeedTime();
    // var lastFeedHours = lastfeed["lastFeedHours"];
    var lastFeedMinutes = lastfeed["lastFeedMinutes"];

    var systemTime = commonActions.getSystemTime();
    // var systemHours = systemTime["systemHours"];
    var systemMinutes = systemTime["systemMinutes"];
    // var systemMinutes = new Date().getMinutes;

    // assert.equal(lastFeedMinutes, systemHours, "Feed hours not match with system hours");
    assert.notEqual(lastFeedMinutes, systemMinutes, "Feed minutes match with system minutes");

    console.log("TEST PASSED");
  }).timeout(100000);
});

async function setFeedTimeOneMinuteAhead() {
  await setFeedTimeForMinutes(1);
}

async function setFeedTimeTwoMinuteBack() {
  await setFeedTimeForMinutes(-1);
}

//minutes should be integer from -60 to 60
async function setFeedTimeForMinutes(minutes) {
  var feedHours = commonActions.getSystemTime()["systemHours"];
  var feedMinutes = commonActions.getSystemTime()["systemMinutes"] + minutes;
  if (feedMinutes >= 60) {
    feedHours = feedHours + 1;
    feedMinutes = feedMinutes - 60;
  } else if (feedMinutes < 0) {
    feedHours = feedHours - 1;
    feedMinutes = feedMinutes + 60;
  }
  await setScheduledFeedTime(feedHours, feedMinutes);
}

async function setScheduledFeedTime(feedHours, feedMinutes) {
  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsFeedHours"],
    feedHours
  );
  await driver.sleep(waitUiPause);

  await commonActions.setDataStreamValue(
    deviceUnderTestingConfig["deviceToken"],
    deviceUnderTestingTemplate["dsFeedMinutes"],
    feedMinutes
  );
  await driver.sleep(waitUiPause);
}

async function waitingScheduledFeedTime() {
  var feedMinutes = parseInt(
    await commonActions.getDataStreamValue(
      deviceUnderTestingConfig["deviceToken"],
      deviceUnderTestingTemplate["dsFeedMinutes"]
    )
  );

  do {
    var systemMinutes = new Date().getMinutes();
    await driver.sleep(waitUiPause * 5);
    console.log("systemMinutes: %d -> wait 1 sec", systemMinutes);
  } while (feedMinutes != systemMinutes);
}
