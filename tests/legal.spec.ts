import { test, expect } from "@playwright/test";
['terms','privacy','refund'].forEach(p=>{
 test`legal page ${p}`, async ({page})=>{
 await page.goto`https://zentrahub.pro/${p}.html`);
 await expect(page.locator('h1')).toBeVisible();
 });
});