const { Builder } = require("selenium-webdriver");
driver = new Builder().forBrowser("chrome").build();

global.waitUiPause = 2000;
global.waitFeedPause = 8000;
global.dataProcessingPause = 7000;
