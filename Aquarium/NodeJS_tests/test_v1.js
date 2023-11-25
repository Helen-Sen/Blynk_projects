var commonActions = require('./common/action/common_actions.js');
var devices = require('./common/config/devices.js');

require("chromedriver");

const { Builder, By, Key } = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;

let vars = {};



//describe - describes test
describe("Open device", function () {
  //it - describes expected behaviour
  it("should open device", async function () {
    // try {
    await driver.get("https://blynk.cloud/dashboard/login");
    await commonActions.login();
    await commonActions.switchToDevice(devices.getAquariumTestConfig());
    await driver.sleep(1000);
    await commonActions.doFeed();

    console.log("TEST PASSED");
    // } finally {
    // await driver.quit();
    // }
  }).timeout(100000);
});
