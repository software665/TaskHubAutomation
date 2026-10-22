import { test } from '@playwright/test';
import { PageManagers } from 'page-manager/Page-Manager';
import { appUrls } from 'playwright.config';
import credentials from 'tests/fixture/test-data-management/Login.json';

test.beforeEach(async ({ page }) => {
    await page.goto(appUrls.loginURL);
});

test('Login without Forgot Password @positive @regression', async ({ page }) => {
    const pm = new PageManagers(page);

     const user1 =credentials.super_admin_credentials;

    await pm.login.loginPage(user1.company, user1.userName, user1.password, false, false);
});

test('Login with Remember Me @positive @smoke', async ({ page }) => {
    const pm = new PageManagers(page);
    
    const user1 =credentials.userone_credentials;

    await pm.login.loginPage(user1.company, user1.userName, user1.password, false, false);
});