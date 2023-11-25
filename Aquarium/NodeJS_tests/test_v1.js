var commonActions = require("./common/action/common_actions.js");
var devices = require("./common/config/devices.js");

//describe - describes test
describe("Open device", function () {
  //it - describes expected behaviour
  it("should open device", async function () {
    await driver.get("https://blynk.cloud/dashboard/login");
    await commonActions.login();
    await commonActions.switchToDevice(devices.getAquariumTestConfig());
    await driver.sleep(1000);
    await commonActions.doFeed();

    console.log("TEST PASSED");
  }).timeout(100000);
});
