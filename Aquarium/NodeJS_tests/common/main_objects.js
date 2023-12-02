const { Builder, By, Key } = require("selenium-webdriver");
driver = new Builder().forBrowser("chrome").build();

global.waitUiPause = 1500;
global.waitFeedPause = 7000;