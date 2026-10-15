import { step } from "helpers/Test-Steps-Decorator";
import { Page, expect } from "@playwright/test";

export class TaskReports {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @step
  async selectReportTask(taskID: string): Promise<void> {
    // Locate the task table
    const table = this.page.locator("table");

    // Find the row containing the exact Task ID
    const taskRow = table.locator("tbody tr").filter({
      has: this.page
        .locator("td:first-child span")
        .getByText(new RegExp(`^${taskID}\\b`)),
    });

    // Verify matching task exists
    await expect(taskRow).toHaveCount(1);

    console.log("Matched Task ID:", taskID);

    // Click matching task row
    await taskRow.click();

    console.log("Clicked Task ID:", taskID);
  }
}
