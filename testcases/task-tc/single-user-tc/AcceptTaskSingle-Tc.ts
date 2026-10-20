import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";
import credentials from "tests/fixture/test-data-management/Login.json";
import acceptSingle from "tests/fixture/test-data-management/tasks/AcceptTaskSingle.json";

export class AcceptTaskSingleTc {
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
  async acceptValidateEditTask(): Promise<void> {
    // Step 1: Login
    await this.loginUser1();
    // Step 2: Create Task
    await this.createTask();
    // Step 3: Validate Created Task
    await this.validateTask();
    // Step 4: Get Task ID
    const taskID = await this.pm.task.getTaskID();
    console.log("Created Task ID -", taskID);

    
     //Task Actions 
  const taskActions = [
  { action: "Accept", status: "Accepted", data: acceptSingle.acceptTask },
  { action: "Start", status: "In Progress", data: acceptSingle.acceptTask },
  { action: "Pause", status: "On Hold", data: acceptSingle.pauseTask },
  { action: "Resume", status: "In Progress", data: acceptSingle.resumeTask },
  { action: "Complete", status: "Completed", data: acceptSingle.completedTask },
  // { action: "Close", status: "Closed", data: acceptSingle.closedTask },
  // { action: "Reopen", status: "Draft", data: acceptSingle.reopenTask },
];

for (const { action, status, data } of taskActions) {

  // Click action, verify status and close toast
  await this.pm.task.taskAction(action, status);
  // Navigate to Task Reports
  await this.pm.navigate.taskReports();
  // Validate task report and reopen task
  await this.pm.taskReports.selectReportTask(taskID, data);

}
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
      acceptSingle.createTask.title,
      acceptSingle.createTask.assignee,
      acceptSingle.createTask.priority,
      acceptSingle.createTask.moreOption,
      acceptSingle.createTask.dueDate,
    );
  }

  /**
   * Validate Created Task
   */
  async validateTask(): Promise<void> {
    await this.pm.task.assertTask(
      acceptSingle.createTask.title,
      acceptSingle.assertTask.createdBy,
      acceptSingle.assertTask.status,
      acceptSingle.createTask.assignee,
    );
  }
}
