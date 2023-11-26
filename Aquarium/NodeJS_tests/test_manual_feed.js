require("./common/main_objects.js");
var commonActions = require("./common/action/common_actions.js");
var aquarium = require("./common/action/aquarium_actions.js");
var devices = require("./common/config/devices.js");

//describe - describes test
describe("Aquarium-Test - manual feed", function () {
  //it - describes expected behaviour
  it("Aquarium-Test should do manual feed", async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await commonActions.login();
    await commonActions.switchToDevice(devices.getAquariumTestConfig());
    await driver.sleep(1000);
    await aquarium.doFeed();
    await driver.sleep(15000);
    var lastfeed = await aquarium.getLastFeedTime();
    // await driver.sleep(1000);
    console.log(lastfeed["lastFeedDateTime"]);
    console.log(lastfeed["lastFeedHours"]);
    console.log(lastfeed["lastFeedMinutes"]);

    var systemTime = await commonActions.getSystemTime();
    var systemHours = systemTime["systemHours"];
    var systemMinutes = systemTime["systemMinutes"];
    console.log(systemTime["systemTime"]);
    console.log(systemHours);
    console.log(systemMinutes);
    

    console.log("TEST PASSED");
  }).timeout(100000);

  // it("Aquarium-Test should do manual feed 2", async function () {
  //   await driver.get("https://blynk.cloud/dashboard");
  //   await driver.sleep(1000);
  //   await commonActions.switchToDevice(devices.getAquariumTestConfig());
  //   await driver.sleep(1000);
  // }).timeout(100000);
});
