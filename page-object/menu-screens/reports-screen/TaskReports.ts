import { step } from "helpers/Test-Steps-Decorator";
import { Page, expect } from "@playwright/test";

export class TaskReports {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @step
async selectReportTask(taskID: string,reportValue:Object): Promise<void> {
  const table = this.page.locator("table");

  // Find the row using Task ID
  const taskRow = table.locator("tbody tr").filter({
    has: this.page.getByText(taskID, { exact: false }),
  });

  await expect(taskRow).toHaveCount(1);

  console.log("Matched Task ID:", taskID);

  // Get expected values from JSON
  const expectedValues = Object.values(reportValue);

  // Assert values inside matched TR
  for (const value of expectedValues) {
    await expect(taskRow).toContainText(value);

    console.log(`Verified: ${value}`);
  }

  // Click the matched row
  await taskRow.click();

  console.log("Clicked Task ID:", taskID);
}
}
