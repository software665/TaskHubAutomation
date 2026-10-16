import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { CreateTaskTc } from "testcases/task-tc/single-user-tc/CreateTask.Tc"; 

test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});

test(
  `Verify successful task creation, validate the task details, update and verify the edited information, locate the task in 
  Task Reports using its generated Task ID, and delete the task. @positive @regression`,
  async ({ page }) => {
    const createTaskTc = new CreateTaskTc(page);

    await createTaskTc.createValidateEditTask();
  },
);
