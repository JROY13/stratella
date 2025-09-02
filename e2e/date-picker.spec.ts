import { test, expect } from "@playwright/test";

test("opens date picker from task row and applies filter", async ({ page }) => {
  test.skip(true, "Application server unavailable in test environment");
  await page.goto("http://localhost:3000/tasks");
  await page.click("text=Select date");
  await page.click("text=Today");
  await expect(page).toHaveURL(/due=/);
});
