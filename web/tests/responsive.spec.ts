import { test, expect, devices } from "@playwright/test";

const ROUTES = [
  "/",
  "/restaurants",
  "/favorites",
  "/profile",
  "/search",
  "/groups",
  "/map",
  "/manager",
  "/restaurants/1",
];

for (const route of ROUTES) {
  test(`no horizontal overflow on ${route} (mobile)`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...devices["iPhone SE"] });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:3000${route}`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, "page must not be wider than the viewport").toBeLessThanOrEqual(0);
    await page.screenshot({ path: `shots/mobile${route.replace(/\//g, "_")}.png`, fullPage: true });
    await ctx.close();
  });
}
