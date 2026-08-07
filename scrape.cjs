
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const results = [];
  
  page.on("request", (req) => {
    if (req.url().includes("/api/")) {
      console.log("REQUEST:", req.url(), req.headers());
    }
  });

  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/api/")) {
      try {
        const text = await response.text();
        console.log("RESPONSE:", url, text.substring(0, 1500));
      } catch (e) {}
    }
  });

  await page.goto("https://footfytv.pro/watch/1677", { waitUntil: "networkidle2" });
  
  await browser.close();
})();

