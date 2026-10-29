
import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";

import credentials from "tests/fixture/test-data-management/Login.json";
import parentTs from "tests/fixture/test-data-management/tasks/ParentTask.json";

import {
  checkList_Add_Assert,
} from "tests/fixture/test-data-management/utils/Test-Task-Fixture";

export class ParentTaskTC {

  readonly page: Page;
  private readonly pm: PageManagers;

  constructor(page: Page) {
    this.page = page;
    this.pm = new PageManagers(page);
  }

  /**
   * Complete Parent Task Test Flow
   *
   * Login -> Create Task -> Checklist
   * -> Attachments -> Capture Task ID -> Delete Task
   */
  async createParentTask(): Promise<void> {

    // Step 1: Login
    await this.loginUser1();

    // Step 2: Create Parent Task
    await this.createTask();

    // Step 3: Add and Validate Checklist
    await this.validateChecklist();

    // Step 4: Upload Attachments
    await this.uploadAttachments();

    // Step 5: Capture Created Task ID
    const taskID = await this.getCreatedTaskID();

    //dependencies 
    await this.pm.task.addDependency(parentTs.dependency.taskID);

    // Step 6: Delete Parent Task
    await this.deleteTask();

    console.log("Parent Task Test Completed:", taskID);
  }

  /**
   * Login User
   */
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
   * Create Parent Task with Due Date and More Options
   */
  async createTask(): Promise<void> {

    const task = parentTs.createTask;

    // Due Date Details
    const dateDetails = task.dueDate
      ? task.dateDetails?.[0]
      : undefined;

    if (task.dueDate) {

      if (
        !dateDetails?.date ||
        !dateDetails?.hour ||
        !dateDetails?.minute ||
        !dateDetails?.period
      ) {
        throw new Error(
          "All dateDetails fields are required when dueDate is true"
        );
      }

      if (!["AM", "PM"].includes(dateDetails.period)) {
        throw new Error("Invalid period. Use AM or PM");
      }

      const hour = Number(dateDetails.hour);
      const minute = Number(dateDetails.minute);

      if (
        !Number.isInteger(hour) ||
        hour < 1 ||
        hour > 12
      ) {
        throw new Error("Hour must be between 1 and 12");
      }

      if (
        !Number.isInteger(minute) ||
        minute < 0 ||
        minute > 59
      ) {
        throw new Error("Minute must be between 0 and 59");
      }
    }

    // More Options Details
    const basicInfo = task.moreOption
      ? task.basicInformation
      : undefined;

    const assignment = task.moreOption
      ? task.assignment
      : undefined;

    if (task.moreOption) {

      if (
        !basicInfo?.category ||
        !basicInfo?.type ||
        !basicInfo?.description ||
        !basicInfo?.tags ||
        !assignment?.assignmentType ||
        !assignment?.assignTo
      ) {
        throw new Error(
          "All More Options fields are required"
        );
      }
    }

    // Create Task - Preserve Existing Parameter Order
    await this.pm.task.createTask(
      task.title,
      task.assignee,
      task.priority,
      task.moreOption,
      task.dueDate,

      // Basic Information
      basicInfo?.category,
      basicInfo?.type,
      basicInfo?.description,
      basicInfo?.tags,

      // Assignment
      assignment?.assignmentType,
      assignment?.assignTo,

      // Due Date
      dateDetails?.date,
      dateDetails?.hour,
      dateDetails?.minute,
      dateDetails?.period as "AM" | "PM" | undefined,
      "#quick-due"
    );

    console.log("Parent Task Created Successfully");
  }

  /**
   * Reusable Method - Checklist Operations
   */
  async validateChecklist(): Promise<void> {

    await checkList_Add_Assert(
      this.page,
      parentTs
    );

    console.log("Checklist Operations Completed");
  }

  /**
   * Reusable Method - Upload Attachments
   */
  async uploadAttachments(): Promise<void> {

    await this.pm.task.attachements(
      parentTs.attachments
    );

    console.log("Attachments Uploaded Successfully");
  }

  /**
   * Reusable Method - Capture Generated Task ID
   */
  async getCreatedTaskID(): Promise<string> {

    const taskID = await this.pm.task.getTaskID();

    console.log("Created Parent Task ID:", taskID);

    return taskID;
  }

  /**
   * Reusable Method - Delete Current Parent Task
   */
  async deleteTask(): Promise<void> {

    await this.pm.task.moreActionButton("Delete");

    console.log("Parent Task Delete Action Completed");
  }
}
