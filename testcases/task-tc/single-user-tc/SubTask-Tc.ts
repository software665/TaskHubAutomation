
import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";

import credentials from "tests/fixture/test-data-management/Login.json";
import subTask from "tests/fixture/test-data-management/tasks/SubTask.json";

import {
  checkList_Add_Assert,
  getSubTaskIDAssert,
} from "tests/fixture/Test-Task-Fixture";

export class SubTaskTC {
  readonly page: Page;
  private readonly pm: PageManagers;

  constructor(page: Page) {
    this.page = page;
    this.pm = new PageManagers(page);
  }

  /**
   * Complete Test Flow
   * Login -> Create -> Validate -> Edit -> Reports
   * -> SubTask -> Checklist -> Attachments
   * -> List Assertions -> Delete
   */
  async createValidateSubTask(): Promise<void> {

    // Step 1: Login
    await this.loginUser1();

    // Step 2: Create Parent Task
    await this.createTask();

    // Step 3: Validate Created Task
    await this.validateTask();

    // Step 4: Get Parent Task ID
    const taskID = await this.pm.task.getTaskID();
    console.log("Created Parent Task ID:", taskID);

    // Step 5: Edit and Validate Task
    await this.editAndValidateTask();

    // Step 6: Validate Task Reports
    await this.validateTaskReports(taskID);

    // Step 7: Create SubTask and Capture ID
    const subTaskID = await this.createAndValidateSubTask();
    console.log("Created SubTask ID:", subTaskID);

    // Step 8: Add and Validate Checklist
    await this.validateChecklist();

    // Step 9: Add Attachments
    await this.uploadAttachments();

    // Step 10: Validate Parent and Child in List View
    await this.validateTaskList(taskID, subTaskID);

    // Step 11: Delete SubTask and Parent Task
    await this.deleteTasks(taskID, subTaskID);

    console.log("SubTask test flow completed successfully");
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
   * Create Parent Task
   */
  async createTask(): Promise<void> {

    await this.pm.task.createTask(
      subTask.createTask.title,
      subTask.createTask.assignee,
      subTask.createTask.priority,
      subTask.createTask.moreOption,
      subTask.createTask.dueDate
    );

    console.log("Parent Task created successfully");
  }

  /**
   * Validate Created Parent Task
   */
  async validateTask(): Promise<void> {

    await this.pm.task.assertTask(
      subTask.createTask.title,
      subTask.assertTask.createdBy,
      subTask.assertTask.status,
      subTask.createTask.assignee,
      subTask.assertTask.followers
    );
  }

  /**
   * Edit Task and Validate Updated Details
   */
  async editAndValidateTask(): Promise<void> {

    // Edit Parent Task
    await this.pm.task.editTaskandSave(
      subTask.createTask.title,
      subTask.editTask.categoryValue,
      subTask.editTask.typeValue,
      subTask.editTask.desValue,
      subTask.editTask.days
    );

    // Assert Edited Task Details
    await this.pm.task.assertEditTask(
      subTask.editTask.days,
      subTask.editTask.desValue
    );

    console.log("Parent Task edited and validated");
  }

  /**
   * Navigate to Task Reports and Validate Task ID
   */
  async validateTaskReports(
    taskID: string
  ): Promise<void> {

    // Navigate to Task Reports
    await this.pm.navigate.taskReports();

    // Select Task Report
    await this.pm.taskReports.selectReportTask(
      taskID,
      subTask.reportTask
    );

    // Assert Parent Task ID
    await this.pm.task.assertTaskID(taskID);

    console.log("Task Report validated:", taskID);
  }

  /**
   * Create SubTask and Capture SubTask ID
   */
  async createAndValidateSubTask(): Promise<string> {

    const tasks = subTask.createSubTask;

    // Create SubTask and Capture ID
    const subTaskID = await getSubTaskIDAssert(
      this.page,
      tasks
    );

    console.log("SubTask created:", subTaskID);

    return subTaskID;
  }

  /**
   * Reusable Method - Checklist Validation
   */
  async validateChecklist(): Promise<void> {

    await checkList_Add_Assert(
      this.page,
      subTask
    );

    console.log("Checklist validation completed");
  }

  /**
   * Reusable Method - Upload Attachments
   */
  async uploadAttachments(): Promise<void> {

    await this.pm.task.attachements(
      subTask.attachments
    );

    console.log("Attachment upload completed");
  }

  /**
   * Validate Parent and Child Task in List View
   */
  async validateTaskList(
    taskID: string,
    subTaskID: string
  ): Promise<void> {

    // Navigate to Task List
    await this.pm.navigate.tasks();

    // Search Parent Task ID
    await this.pm.task.searchBar(taskID);

    // Validate Parent Task
    await this.pm.task.parentListViewAssert(
      taskID,
      subTask.parentListViewAssert.title,
      subTask.parentListViewAssert.status,
      subTask.parentListViewAssert.priority
    );

    // Validate Child Task under Parent Task
    await this.pm.task.childTaskAssert(
      taskID,
      subTaskID,
      subTask.childListViewAssert.title,
      subTask.childListViewAssert.status,
      subTask.childListViewAssert.priority,
      subTask.childListViewAssert.slaStatus
    );

    console.log("Parent and Child Task list validation completed");
  }

  /**
   * Reusable Method - Delete Task by Task ID
   */
  async deleteTask(taskID: string): Promise<void> {

    // Navigate to Tasks
    await this.pm.navigate.tasks();

    // Search Task ID
    await this.pm.task.searchBar(taskID);

    // Click Task ID
    await this.pm.task.clickTaskID(taskID);

    // Delete Task
    await this.pm.task.moreActionButton("Delete");

    console.log("Delete action completed for Task ID:", taskID);
  }

  /**
   * Delete SubTask First, Then Parent Task
   */
  async deleteTasks(
    taskID: string,
    subTaskID: string
  ): Promise<void> {

    // Step 1: Delete Child Task
    await this.deleteTask(subTaskID);

    // Step 2: Delete Parent Task
    await this.deleteTask(taskID);

    console.log("SubTask and Parent Task delete actions completed");
  }
}
