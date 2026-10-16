import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";
import credentials from "tests/fixture/test-data-management/Login.json";
import task from "tests/fixture/test-data-management/tasks/CreateTaskSingle.json";

export class CreateTaskSingleTc {
  readonly page: Page;
  private pm: PageManagers;

  constructor(page: Page) {
    this.page = page;
    this.pm = new PageManagers(page);
  }

  /**
   * Complete Test Flow
   * Login -> Create -> Validate -> Edit -> Assert -> Task ID
   */
  async createValidateEditTask(): Promise<void> {
    // Step 1: Login
    await this.loginUser1();
    // Step 2: Create Task
    await this.createTask();
    // Step 3: Validate Created Task
    await this.validateTask();
    // Step 4: Get Task ID
    const taskID = await this.pm.task.getTaskID();
    console.log("Created Task ID -", taskID);
    // Step 5: Edit Task and Save
    await this.pm.task.editTaskandSave(
      task.createTask.title,
      task.editTask.categoryValue,
      task.editTask.typeValue,
      task.editTask.desValue,
      task.editTask.days,
    );
    // Step 6: Assert Edited Task Details
    await this.pm.task.assertEditTask(
      task.editTask.days,
      task.editTask.desValue,
    );

    //navigate task Reports
    await this.pm.navigate.taskReports();

    //select reports
    await this.pm.taskReports.selectReportTask(taskID,task.reportTask);
    //taskID assert 
    await this.pm.task.assertTaskID(taskID);
    //delete
    await this.pm.task.moreButton("Delete");
   
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
      false,
    );
  }

  /**
   * Create Task
   */
  async createTask(): Promise<void> {
    await this.pm.task.createTask(
      task.createTask.title,
      task.createTask.assignee,
      task.createTask.priority,
      task.createTask.moreOption,
      task.createTask.dueDate,
    );
  }

  /**
   * Validate Created Task
   */
  async validateTask(): Promise<void> {
    await this.pm.task.assertTask(
      task.createTask.title,
      task.assertTask.createdBy,
      task.assertTask.status,
      task.createTask.assignee,
      task.assertTask.followers,
    );
  }
}
