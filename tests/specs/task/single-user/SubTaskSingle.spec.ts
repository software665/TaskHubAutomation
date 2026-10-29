
import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { SubTaskTC } from "testcases/task-tc/single-user-tc/SubTask-Tc";

test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});

test(
`Verify successful parent task creation, 
  validate task details, update and verify edited information, 
  create and validate a sub-task, verify parent and sub-task details in the task list, 
  and delete both tasks. @positive @regression`,
  async ({ page }) => {
    const subTask = new SubTaskTC(page);
    await subTask.createValidateSubTask();
  },
);
