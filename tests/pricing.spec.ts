import { test, expect } from "@playwright/test";
test('pricing buttons respond', async ({page})=>{
 await page.goto('https://zentrahub.pro#pricing');
 await page.click('button:text("ابدأ الآن")');
 await expect(page.locator('text=Sign In')).toBeVisible();
});