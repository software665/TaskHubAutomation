import { Page } from "@playwright/test";
import { PageManagers } from "page-manager/Page-Manager";
import credentials from "tests/fixture/test-data-management/Login.json";
import taskFilter from "tests/fixture/test-data-management/tasks/FilterTask.json"


export class FilterTaskTC{
      readonly page: Page;
      private pm: PageManagers;
    
      constructor(page: Page) {
        this.page = page;
        this.pm = new PageManagers(page);
      }

    async filterValidate():Promise<void>{
     // Step 1: Login
    await this.loginUser1();
    // task filter
    await this.taskTabFilter();

    
    }


async taskTabFilter(): Promise<void> {

    // Navigate to Tasks tab
    await this.pm.navigate.tasks();

    // Loop through all task data
    for (const task of Object.values(taskFilter)) {

        // Search by Task ID
        await this.pm.task.searchBar(task.taskID);

        // Filter by Status
        await this.pm.task.filterBy('Status', task.status);

        // Validate list view
        await this.pm.task.parentListViewAssert(
            task.taskID,
            task.taskName,
            task.status,
            task.priority,
 
        );

        // Clear filters before applying Priority
        await this.pm.task.clearFilter();

        // Search again if clearFilter resets the search
        await this.pm.task.searchBar(task.taskID);

        // Filter by Priority
        await this.pm.task.filterBy('Priority', task.priority);

        // Validate list view again
        await this.pm.task.parentListViewAssert(
            task.taskID,
            task.taskName,
            task.status,
            task.priority
        );

        // Clear filters for next iteration
        await this.pm.task.clearFilter();

        // Search again if clearFilter resets the search
        await this.pm.task.searchBar(task.taskID);

        // Filter by Priority
        await this.pm.task.filterBy('Category', task.category);

        // Validate list view again
        await this.pm.task.parentListViewAssert(
            task.taskID,
            task.taskName,
            task.status,
            task.priority
        );

        // Clear filters for next iteration
        await this.pm.task.clearFilter();
    }
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
    

}