
import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";
import credentials from "tests/fixture/test-data-management/Login.json";
import dueDate from "tests/fixture/test-data-management/tasks/DueDateMore.json";
import { checkList_Add_Assert } from "tests/fixture/Test-Task-Fixture";

export class DueDateMoreTc {
  readonly page: Page;
  private pm: PageManagers;

  constructor(page: Page) {
    this.page = page;
    this.pm = new PageManagers(page);
  }

  async createDueDate_MoreOption(): Promise<void> {

    await this.loginUser1();
    await this.createTask();
    //add
    await checkList_Add_Assert(this.page,dueDate)
  
    //attachements
    await this.pm.task.attachements(dueDate.attachments);
    const taskID = await this.pm.task.getTaskID();
    console.log("Created Task ID -", taskID);

    //delete
    await this.pm.task.moreButton("Delete");


    
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

  async createTask(): Promise<void> {
    const task = dueDate.createTask;

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

    // Create Task - Correct Parameter Order
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

    console.log("Task created successfully");
  }
}
