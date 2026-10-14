import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { CreateTaskTc } from "testcases/task-tc/CreateTask.Tc"; 

test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});

test(
  "Verify task creation, validate task details, and delete the task @positive @regression",
  async ({ page }) => {
    const createTaskTc = new CreateTaskTc(page);

    await createTaskTc.createValidateDeleteTask();
  },
);
