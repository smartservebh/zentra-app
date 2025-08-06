import { test, expect } from "@playwright/test";
const base='https://zentrahub.pro';
test('navigation and language toggle', async ({page})=>{
 await page.goto(base);
 await page.click('a:text("المميزات")');
 await expect(page).toHaveURL(/#features/);
 await page.click('text=English');
 await expect(page.locator('text=Start Creating Today')).toBeVisible();
 await page.click('text=العربية');
 await expect(page.locator('text=ابدأ الآن')).toBeVisible();
});