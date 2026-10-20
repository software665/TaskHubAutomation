import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { AcceptTaskSingleTc } from "testcases/task-tc/single-user-tc/AcceptTaskSingle-Tc";


test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});


test.describe("Task Lifecycle Validation @regression @smoke", () => {

  test(
    `Verify task creation and complete task lifecycle:
     Open → Accepted → In Progress → On Hold →
     In Progress → Completed → Closed → Draft.
     Validate task details in Task Reports after each status transition.`,
    async ({ page }) => {

      const acceptTaskTc = new AcceptTaskSingleTc(page);

      await acceptTaskTc.acceptValidateEditTask();

    }
  );

});