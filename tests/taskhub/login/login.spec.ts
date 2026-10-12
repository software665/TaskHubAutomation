import { test } from '@playwright/test';
import { PageManagers } from 'page-manager/page-manager';
import { appUrls } from 'playwright.config';
import credentials from 'tests/fixture/test-data-management/login.json';

test.beforeEach(async ({ page }) => {
    await page.goto(appUrls.loginURL);
});

test('Login without Forgot Password and Remember Me @positive @regression', async ({ page }) => {
    const pm = new PageManagers(page);

    const { company: tenant, userName, password } =
        credentials.super_admin_credentials;

    await pm.login.loginPage(tenant, userName, password, false, false);
});

test('Login with Remember Me @positive @smoke', async ({ page }) => {
    const pm = new PageManagers(page);

    const { company: tenant, userName, password } =
        credentials.userone_credentials;

    await pm.login.loginPage(tenant, userName, password, true, false);
});