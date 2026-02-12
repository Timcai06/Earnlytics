import { test, expect } from "@playwright/test";

test.describe("Cross-Browser Compatibility", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Earnlytics/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");
    
    await page.click('a[href="/companies"]');
    await expect(page).toHaveURL(/\/companies/);
    
    await page.click('a[href="/calendar"]');
    await expect(page).toHaveURL(/\/calendar/);
  });

  test("responsive layout works", async ({ page }) => {
    await page.goto("/");
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator("header")).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("header")).toBeVisible();
  });

  test("charts render correctly", async ({ page }) => {
    await page.goto("/dashboard");
    
    const chartContainer = page.locator(".recharts-wrapper").first();
    await expect(chartContainer).toBeVisible();
  });

  test("forms work correctly", async ({ page }) => {
    await page.goto("/");
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("test@example.com");
      await expect(emailInput).toHaveValue("test@example.com");
    }
  });
});
