require("chromedriver");
const { Builder, By, Key } = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;

// var options = new chrome.Options();
// options.addArguments("--no-sandbox");
// options.addArguments("--headless");
// options.addArguments("--ignore-certificate-errors");
// options.addArguments("--disable-dev-shm-usage");
// options.addArguments("--disable-extensions");

driver = new Builder().forBrowser("chrome")
// .setChromeOptions(options.setPageLoadStrategy('normal'))
.build();

let vars = {};

async function login() {
  await driver.get("https://blynk.cloud/dashboard/login");
  try {
    await driver.findElement(By.xpath("//span[text()='Go to Web Console']")).click();
  } catch {}
  await driver.findElement(By.xpath('//*[@id="email"]')).click();
  await driver.findElement(By.id("email")).sendKeys("i.miflig@gmail.com");
  await driver.findElement(By.xpath('//*[@id="password"]')).click();
  await driver.findElement(By.id("password")).sendKeys("Cat-12345");
  await driver.findElement(By.xpath("//button[@type='submit']")).click();
  await driver.sleep(2000);
  await driver.findElement(By.xpath("//div[contains(@class,'user-layout__news-tooltip-wrapper')]")).click();
  console.log("login is done");
}

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
    // await driver.get("https://blynk.cloud/dashboard/login");
    await login();

    await aquariumTestConfig();
    await shitchToDevice(vars);

    console.log("TEST PASSED");
    // } finally {
    // await driver.quit();
    // }
  }).timeout(10000);
});
