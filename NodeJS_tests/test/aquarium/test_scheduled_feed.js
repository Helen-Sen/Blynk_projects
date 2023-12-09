var chai = require("chai");
var assert = chai.assert;

const { Builder, By, Key } = require("selenium-webdriver");

require("../../common/main_objects.js");
var commonActions = require("../../common/action/common_actions.js");
var aquariumActions = require("../../common/action/aquarium_actions.js");
var currentTimeOffSet;
var currentScheduledfeedHours;
var currentScheduledfeedMinutes;

//describe - describes test
describe("Aquarium - scheduled feed", function () {
  this.timeout(10000000);
  before(async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await driver.sleep(waitUiPause);
    await commonActions.login();
    await driver.sleep(waitUiPause);
    currentTimeOffSet = await commonActions.getCurrentDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate);
    await driver.sleep(waitUiPause);
    currentScheduledfeedHours = await getScheduledFeedHours();
    console.log("currentScheduledfeedHours = %d", currentScheduledfeedHours);
    await driver.sleep(waitUiPause);
    currentScheduledfeedMinutes = await getScheduledFeedMinutes();
    console.log("currentScheduledfeedMinutes = %d", currentScheduledfeedMinutes);
    await driver.sleep(waitUiPause);

    console.log("END BEFORE");
  });

  after(async function () {
    await commonActions.setDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate, currentTimeOffSet);
    await driver.sleep(waitUiPause);
    await setScheduledFeedTime(currentScheduledfeedHours, currentScheduledfeedMinutes);
    await driver.sleep(waitUiPause);

    await driver.quit();
    console.log("END AFTER");
  });

  it("Aquarium should do scheduled feed", async function () {
    await commonActions.setDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate, commonActions.getSystemTimeZone());
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await setFeedTimeOneMinuteAhead();

    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.switchDeviceOn(deviceUnderTestingConfig);
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
    await commonActions.setDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate, commonActions.getSystemTimeZone());
    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.doDeviceOn(deviceUnderTestingConfig);
    }
    await driver.sleep(waitUiPause);
    await commonActions.waitForNewMinuteIfSecondsMore(45);
    await aquariumActions.doFeed();
    await driver.sleep(waitFeedPause);
    await setFeedTimeOneMinuteAhead();
    await waitingScheduledFeedTime();
    await driver.sleep(dataProcessingPause);
    await commonActions.switchToDevice(deviceUnderTestingConfig);
    await driver.sleep(waitFeedPause);
    var lastfeed = await aquariumActions.getLastFeedTime();
    var lastFeedMinutes = lastfeed["lastFeedMinutes"];

    var systemTime = commonActions.getSystemTime();
    var systemMinutes = systemTime["systemMinutes"];

    assert.notEqual(lastFeedMinutes, systemMinutes, "Feed minutes match with system minutes");

    console.log("TEST PASSED");
  }).timeout(100000);

  it("Aquarium should do scheduled feed after power outage", async function () {
    await commonActions.setDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate, commonActions.getSystemTimeZone());
    await commonActions.switchPower(false);
    await commonActions.waitDeviceOnlineState(deviceUnderTestingConfig, false, 10);
    await commonActions.waitForNewMinuteIfSecondsMore(40);
    await setFeedTimeOneMinuteAhead();
    await driver.sleep(waitUiPause);

    await commonActions.switchPower(true);
    await driver.sleep(waitUiPause);
    await commonActions.waitDeviceOnlineState(deviceUnderTestingConfig, true, 2);
    await driver.sleep(waitUiPause);

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
  }).timeout(300000);

  it("Aquarium shouldn't do scheduled feed if system time more than scheduled time", async function () {
    await commonActions.setDeviceTimeOffSet(deviceUnderTestingConfig, deviceUnderTestingTemplate, commonActions.getSystemTimeZone());
    await setFeedTimeForMinutes(-2);
    var scheduledFeedMinutes = await getScheduledFeedMinutes();

    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.switchDeviceOn(deviceUnderTestingConfig);
    }

    await aquariumActions.resetFeedState();
    await driver.sleep(30000);
    var lastfeed = await aquariumActions.getLastFeedTime();
    var lastFeedMinutes = lastfeed["lastFeedMinutes"];

    assert.notEqual(lastFeedMinutes, scheduledFeedMinutes, "Scheduled feed minutes should NOT match with last feed minutes");

    console.log("TEST PASSED");
  }).timeout(200000);

  it("Aquarium should reset feed state at 00:00", async function () {
    await driver.sleep(waitUiPause);
    await commonActions.setTimeOffSetForNeedeedHours(deviceUnderTestingConfig, deviceUnderTestingTemplate, 23);

    if (!(await commonActions.isDeviceOnline(deviceUnderTestingConfig))) {
      await commonActions.switchDeviceOn(deviceUnderTestingConfig);
    }

    await aquariumActions.doFeed();
    await driver.sleep(waitFeedPause * 2);

    var lastFeedHours = (await aquariumActions.getLastFeedTime())["lastFeedHours"];
    console.log("lastFeedHours = %s", lastFeedHours);
    assert.equal(lastFeedHours, 23, "Last feed hours must be 23");

    var feedStateBeforeMidnight = await aquariumActions.getCurrentFeedState();
    console.log("feedStateBeforeMidnight = %s", feedStateBeforeMidnight);

    assert.equal(feedStateBeforeMidnight, "Done", "Feed state must be Done");

    await commonActions.switchToDevice(deviceUnderTestingConfig);

    await waitForNeededMinutes(0);
    // await waitForNeededMinutes(new Date.getMinutes() + 1); // For debugging
    await driver.sleep(dataProcessingPause);

    var feedStateAfterMidnight = await aquariumActions.getCurrentFeedState();
    console.log("feedStateAfterMidnight = %s", feedStateAfterMidnight);

    assert.equal(feedStateAfterMidnight, "Expected", "Feed state must be Expected");

    console.log("TEST PASSED");
  }).timeout(1000000);
});

async function waitForNeededMinutes(minutes) {
  console.log("Waiting for minutes = %d", minutes);
  do {
    var systemMinutes = new Date().getMinutes();
    await driver.sleep(waitUiPause * 10);
    console.log("systemMinutes: %d -> wait 10 sec", systemMinutes);
  } while (systemMinutes != minutes);
  console.log("waitForNeededMinutes: finished");
}

async function setFeedTimeOneMinuteAhead() {
  await setFeedTimeForMinutes(1);
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
  await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsFeedHours"], feedHours);
  await driver.sleep(waitUiPause);

  await commonActions.setDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsFeedMinutes"], feedMinutes);
  await driver.sleep(waitUiPause);
}

async function getScheduledFeedMinutes() {
  var feedMinutes = parseInt(
    await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsFeedMinutes"])
  );
  return feedMinutes;
}

async function getScheduledFeedHours() {
  var feedHours = parseInt(
    await commonActions.getDataStreamValue(deviceUnderTestingConfig["deviceToken"], deviceUnderTestingTemplate["dsFeedHours"])
  );
  return feedHours;
}

async function waitingScheduledFeedTime() {
  var feedMinutes = await getScheduledFeedMinutes();
  console.log("Waiting for scheduled feedMinutes = %d", feedMinutes);
  do {
    var systemMinutes = new Date().getMinutes();
    await driver.sleep(waitUiPause * 5);
    console.log("systemMinutes: %d -> wait 1 sec", systemMinutes);
  } while (feedMinutes != systemMinutes);
}
