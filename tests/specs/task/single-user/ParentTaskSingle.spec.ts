
import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { ParentTaskTC } from "testcases/task-tc/single-user-tc/ParentTask-Tc";

test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});

test.describe("Parent Task - Checklist and Attachment @regression @smoke", () => {

  test(
    `Verify successful parent task creation with due date and additional options,
    add and validate checklist items, check and uncheck checklist items,
    remove checklist items, upload attachments, capture the generated Task ID,
    and delete the parent task using More Actions. @positive`,
    async ({ page }) => {

      const parent = new ParentTaskTC(page);

      await parent.createParentTask();
    },
  );

});
