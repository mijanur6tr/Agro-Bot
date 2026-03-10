import puppeteer, { Browser, Page } from "puppeteer";

export interface ScrapedContent {
  text: string;
  title?: string;
  url: string;
}

let browser: Browser | null = null;

// Reuse browser instance for better performance
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  let page: Page | null = null;

  try {
    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();

    // Set timeout and viewport
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    page.setViewport({ width: 1280, height: 720 });

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log(`🔄 Scraping: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract content
    const content = await page.evaluate(() => {
  const article = document.querySelector("#mw-content-text");

  if (!article) {
    return { text: "", title: document.title };
  }

  // Remove unwanted elements
  article.querySelectorAll(
    "script, style, table, sup.reference, .mw-editsection, .mw-references-wrap, .navbox, .metadata"
  ).forEach((el) => el.remove());

  const paragraphs = Array.from(article.querySelectorAll("p"))
    .map((p) => p.innerText.trim())
    .filter((p) => p.length > 0);

  const text = paragraphs.join("\n\n");

  return {
    text,
    title: document.title,
  };
});
    // const content = await page.evaluate(() => {
    //   // Remove script, style, and other non-content elements
    //   const scripts = document.querySelectorAll(
    //     "script, style, noscript, meta, title"
    //   );
    //   scripts.forEach((el) => el.remove());

    //   // Get text content
    //   const textContent = document.body.innerText;
    //   const title = document.title;

    //   return { text: textContent, title };
    // });

    console.log(`✓ Successfully scraped: ${url}`);

    return {
      text: content.text,
      title: content.title,
      url,
    };
  } catch (error) {
    console.error(`✗ Failed to scrape ${url}:`, error);
    throw new Error(`Failed to scrape website: ${url}`);
  } finally {
    if (page) {
      await page.close();
    }
  }
}

export async function scrapeMultipleWebsites(
  urls: string[]
): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = [];

  for (const url of urls) {
    try {
      const content = await scrapeWebsite(url);
      results.push(content);
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      // Continue with next URL instead of throwing
    }
  }

  return results;
}
