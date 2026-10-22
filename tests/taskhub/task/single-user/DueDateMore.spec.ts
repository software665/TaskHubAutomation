import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { DueDateMoreTc } from "testcases/task-tc/single-user-tc/DueDateMore-Tc";


test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});


test.describe("CheckList and Attachment @regression @smoke", () => {

  test(
    `Verify task checklist and attachment operations with deletion:
     Create task → Add checklist items → Check items →
     Uncheck/remove items → Upload attachments →
     Capture Task ID → Delete task via More options.`,
    async ({ page }) => {

      const due = new DueDateMoreTc(page);

      await due.createDueDate_MoreOption();
    },
  );

});


