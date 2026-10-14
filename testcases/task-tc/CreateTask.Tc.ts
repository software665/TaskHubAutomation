import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/page-manager";
import credentials from "tests/fixture/test-data-management/Login.json";
import task from "tests/fixture/test-data-management/tasks/CreateTask.json";

export class CreateTaskTc {
  private pm: PageManagers;

  constructor(page: Page) {
    this.pm = new PageManagers(page);
  }

  // Login
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

  // Create Task
  async createTask(): Promise<void> {
    await this.pm.task.createTask(
      task.createTask.title,
      task.createTask.assignee,
      task.createTask.priority,
      task.createTask.dueDate,
      task.createTask.moreOption,
    );
  }

  // Validate Task
  async validateTask(): Promise<void> {
    await this.pm.task.assertTask(
      task.assertTask.title,
      task.assertTask.createdBy,
        task.assertTask.status,
        task.assertTask.assignee,
        task.assertTask.followers
    );
  }

  // Delete Task
  async deleteTask(): Promise<void> {
    await this.pm.task.moreButton("Delete");
  }

  // Complete Test Flow
  async createValidateDeleteTask(): Promise<void> {
    await this.loginUser1();
    await this.createTask();
    await this.validateTask();
    await this.deleteTask();
  }
}