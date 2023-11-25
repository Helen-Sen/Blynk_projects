// import { login } from './reuse.js';
var reuse = require('./my_libs/reuse.js');
// var a = require('./my_libs/');

require("chromedriver");

// require("./my_libs/reuse.js");
// import login from './my_libs/reuse';


const { Builder, By, Key } = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;

// var options = new chrome.Options();
// options.addArguments("--no-sandbox");
// options.addArguments("--headless");
// options.addArguments("--ignore-certificate-errors");
// options.addArguments("--disable-dev-shm-usage");
// options.addArguments("--disable-extensions");

// driver = new Builder().forBrowser("chrome");
// // .setChromeOptions(options.setPageLoadStrategy('normal'))
// .build();

let vars = {};



async function aquariumTestConfig() {
  vars["deviceName"] = "Aquarium test";
  vars["deviceToken"] = "ZFbdiBHXrv_mtYCIn1pBfwKJllf2K706";
  vars["luminosityThreshold"] = 40;
  vars["luminosityIncreasingWithLight"] = false;
  console.log("aquariumTestConfig is done");
}

async function shitchToDevice(device) {
  await driver.get("https://blynk.cloud/dashboard");
  await driver.sleep(1000);
  await driver.findElement(By.xpath("//div[text()='" + device["deviceName"] + "']")).click();
  console.log("shitchToDevice is done");
}

//describe - describes test
describe("Open device", function () {
  //it - describes expected behaviour
  it("should open device", async function () {
    // try {
    await driver.get("https://blynk.cloud/dashboard/login");
    await reuse.login(driver);

    await aquariumTestConfig();
    await shitchToDevice(vars);

    console.log("TEST PASSED");
    // } finally {
    // await driver.quit();
    // }
  }).timeout(100000);
});
