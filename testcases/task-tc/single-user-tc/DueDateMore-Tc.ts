
import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";
import credentials from "tests/fixture/test-data-management/Login.json";
import dueDate from "tests/fixture/test-data-management/tasks/DueDateMore.json";

export class DueDateMoreTc {
  readonly page: Page;
  private pm: PageManagers;

  constructor(page: Page) {
    this.page = page;
    this.pm = new PageManagers(page);
  }

  async createDueDate_MoreOption(): Promise<void> {
    // Step 1: Login
    await this.loginUser1();

    // Step 2: Create Task
    await this.createTask();

    // Step 3: Pause for debugging
    //await this.page.pause();
  }

  async loginUser1(): Promise<void> {
    const user1 = credentials.userone_credentials;

    await this.pm.login.loginPage(
      user1.company,
      user1.userName,
      user1.password,
      false,
      false
    );
  }

  /**
   * Create Task with Due Date and More Options
   */
  async createTask(): Promise<void> {
    const task = dueDate.createTask;

    // Get date details only when dueDate is true
    const dateDetails = task.dueDate
      ? task.dateDetails?.[0]
      : undefined;

    // Validate date details
    if (task.dueDate) {
      if (
        !dateDetails ||
        !dateDetails.date ||
        !dateDetails.hour ||
        !dateDetails.minute ||
        !dateDetails.period
      ) {
        throw new Error(
          "All dateDetails fields are required when dueDate is true"
        );
      }

      if (!["AM", "PM"].includes(dateDetails.period)) {
        throw new Error(
          "Invalid period. Use AM or PM"
        );
      }

      const hour = Number(dateDetails.hour);
      const minute = Number(dateDetails.minute);

      if (
        !Number.isInteger(hour) ||
        hour < 1 ||
        hour > 12
      ) {
        throw new Error(
          "Invalid hour. Use a value between 1 and 12"
        );
      }

      if (
        !Number.isInteger(minute) ||
        minute < 0 ||
        minute > 59
      ) {
        throw new Error(
          "Invalid minute. Use a value between 0 and 59"
        );
      }
    }

    // Create task
    await this.pm.task.createTask(
      task.title,
      task.assignee,
      task.priority,
      task.moreOption,
      task.dueDate,
      dateDetails?.date,
      dateDetails?.hour,
      dateDetails?.minute,
      dateDetails?.period as "AM" | "PM" | undefined,
      "#quick-due"
    );

    console.log("Task created successfully");
  }
}
