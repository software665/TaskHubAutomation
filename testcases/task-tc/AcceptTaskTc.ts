import { PageManagers } from "page-manager/Page-Manager"; 
import credentials from "tests/fixture/test-data-management/Login.json";
import task from "tests/fixture/test-data-management/tasks/CreateTask.json";
import type { Page } from "@playwright/test";

export class AcceptTaskTc {
  private pm: PageManagers;
  private page: Page;

  constructor(page: Page) {
    this.page =page;
    this.pm = new PageManagers(page);
  }

  async acceptTaskFlow(): Promise<void> {
    //user 1 login
    const taskID = await this.createTaskAndGetID();

    //logout
    await this.logoutAndLoginUser2();
    //
    await this.verifyTaskNotification(taskID);
    await this.page.pause();
    //accept 
    await this.pm.task.accept();


  }

  async createTaskAndGetID(): Promise<string> {
    const user1 = credentials.userone_credentials;

    await this.pm.login.loginPage(
      user1.company,
      user1.userName,
      user1.password,
      false,
      false,
    );

    await this.pm.task.createTask(
      task.createTask.title,
      task.createTask.assignee,
      task.createTask.priority,
      task.createTask.dueDate,
      task.createTask.moreOption,
    );

    const taskID = await this.pm.task.getTaskID();
    console.log("Task ID -", taskID);

    return taskID;
  }

  async logoutAndLoginUser2(): Promise<void> {
    await this.pm.login.logout();

    const user2 = credentials.usertwo_credentials;

    await this.pm.login.loginPage(
      user2.company,
      user2.userName,
      user2.password,
      false,
      false,
    );
  }

  async verifyTaskNotification(taskID: string): Promise<void> {
    await this.pm.navigate.notification(taskID);
  }
}



