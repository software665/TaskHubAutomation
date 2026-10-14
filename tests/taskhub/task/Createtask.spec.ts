import { test } from '@playwright/test';
import { PageManagers } from 'page-manager/page-manager';
import { appUrls } from 'playwright.config';
import credentials from 'tests/fixture/test-data-management/Login.json';
import task from "tests/fixture/test-data-management/tasks/CreateTask.json"


test.beforeEach(async ({ page }) => {
    await page.goto(appUrls.loginURL);
});

test('Verify task creation, validate task details, and delete the task @positive @regression', async ({ page }) => {
    const pm = new PageManagers(page);

    const { company: tenant, userName, password } =
        credentials.userone_credentials;

    await pm.login.loginPage(tenant, userName, password, false, false);

    await pm.task.createTask(
        task.createTask.title,
        task.createTask.assignee,
        task.createTask.priority,
        task.createTask.dueDate,
        task.createTask.moreOption
    );

    //assert
    await pm.task.assertTask(task.assertTask.title,
        task.assertTask.createdBy,
        task.assertTask.status,
        task.assertTask.assignee,
        task.assertTask.followers);
    
    await pm.task.clickMoreAndDelete();

})