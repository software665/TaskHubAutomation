import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { DueDateMoreTc } from "testcases/task-tc/single-user-tc/DueDateMore-Tc";


test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});


test.describe("CheckList and Attachment @regression @smoke", () => {

  test(
    `Verify task creation and complete task lifecycle:
     Open → Accepted → In Progress → On Hold →
     In Progress → Completed → Closed → Draft.
     Validate task details in Task Reports after each status transition.`,
    async ({ page }) => {

      const due = new DueDateMoreTc(page);

      await due.createDueDate_MoreOption();
   
    })

});


