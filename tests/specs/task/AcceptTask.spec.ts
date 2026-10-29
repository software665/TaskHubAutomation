import { test } from '@playwright/test';
import { AcceptTaskTc } from 'testcases/task-tc/AcceptTaskTc';
import { appUrls } from 'playwright.config';

test.beforeEach(async ({ page }) => {
    await page.goto(appUrls.loginURL);
});

test(
    `Verify task creation and validate the task details.
    Create a subtask using User Login 1, then log out
    and log in with User Login 2. Click the notification
    icon, verify the task ID, and accept the task.
    @positive @regression`,

    async ({ page }) => {
        const acceptTask = new AcceptTaskTc(page);

        await acceptTask.acceptTaskFlow();
    }
);