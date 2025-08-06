import { test, expect } from "@playwright/test";
const base='https://zentrahub.pro';
test('signup/login/logout', async ({page, context})=>{
 const rnd=Math.floor(Math.random()\*1e6);
 await page.goto(base+'/signup');
 await page.fill('[name="username"]', 'user'+rnd);
 await page.fill('[name="email"]', `user${rnd}@mailinator.com`);
 await page.fill('[name="password"]', 'Passw0rd!');
 await page.fill('[name="confirmPassword"]', 'Passw0rd!');
 await page.check('input[type="checkbox"]');
 await page.click('button:text("Create Account")');
 await expect(page).toHaveURL(/dashboard|login/, {timeout:15_000});
 await page.goto(base+'/login');
 await page.fill('[name="email"]', `user${rnd}@mailinator.com`);
 await page.fill('[name="password"]', 'Passw0rd!');
 await page.click('button:text("Sign In")');
 await expect(page).toHaveURL(/dashboard/, {timeout:10_000});
 // Google popup
 const [popup] = await Promise.all([
 context.waitForEvent('page'),
 page.click('text=Continue with Google')
 ]);
 await expect(popup).toHaveURL(/accounts\.google\.com/);
});