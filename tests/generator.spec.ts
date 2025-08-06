import { test, expect } from "@playwright/test";
test('generate app from prompt', async ({page})=>{
 await page.goto('https://zentrahub.pro');
 await page.fill('textarea','Create a todo list app');
 await page.click('button:text("إنشاء التطبيق")');
 await page.waitForSelector('.app-preview', {timeout:20_000});
});