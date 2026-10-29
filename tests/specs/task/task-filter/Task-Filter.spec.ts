import { test } from "@playwright/test";
import { appUrls } from "playwright.config";
import { FilterTaskTC } from "testcases/task-tc/single-user-tc/FilterTask-Tc";


test.beforeEach(async ({ page }) => {
  await page.goto(appUrls.loginURL);
});


test.describe("Verify Task List filter view  @regression @smoke", () => {

  test(
    `Verify existing task records by applying Status, Priority, and 
    Category filters in the Tasks list. Validate that the filtered 
    results display the correct Task ID, Task Name, Status, Priority, and Category.

Additionally, verify the complete task lifecycle in the following sequence: 
Open → Accepted → In Progress → On Hold → In Progress → Completed → Closed → Draft. 
After each status transition, validate the updated task details in the Tasks list and 
Task Reports to ensure that all displayed information matches the expected values.`,
    async ({ page }) => {

      const filter = new FilterTaskTC(page);

      await filter.filterValidate();
      
    }
  );

});


