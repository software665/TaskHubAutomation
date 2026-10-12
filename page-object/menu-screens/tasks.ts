
import { step } from "helpers/test-steps-decorator";
import { Page, expect } from "@playwright/test";

export class CreateTask {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

      /**
     * @param title passing string value in the title Field
     * @param assignee passing string value in the assignee Field
     * @param priority passing string value in the priority Field
     * @param moreOptions passing boolean
     * @param dueDate passing boolean
     * @param date passing String 
     */

    @step
    async createTask(
        title: string,
        assignee: string,
        priority: string,
        moreOptions: boolean,
        dueDate?: boolean,
        date: string = "",
    ) {
        // Button
        await this.addTaskButton();

        // Task Title
        await this.page.locator("#quick-title").fill(title);

        // Assign To
        await this.page.locator("#quick-assignee").fill(assignee);
        await this.page.getByRole("option").filter({ hasText: assignee }).click();

        // Priority
        await this.page.locator("#quick-priority").click();
        await this.page.getByRole("option", {name: priority,exact: true}).click();

        // Due Date
        if (dueDate) {
            await this.page.locator("#quick-due").fill(date);
        }

        if (moreOptions) {
            // More Options
        await this.page.getByRole('button', { name: 'More Options' }).click();
        }

        // Create Task
        await this.createTaskButton();
    }

    async addTaskButton() {
        await this.page.getByRole("button", {name: "Create Task",exact: true}).last().click();
    }

    async createTaskButton(){
        await this.page.getByRole("button", {name: "Create Task",exact: true}).last().click();

    }

        /**
     * @param title passing string value in the title Field
     * @param assignee passing string value in the assignee Field
     * @param status passing string value in the status Field
     */

    async assertTask(title :string ,assignee:string, status :string):Promise<void>{
        //heading
        await expect(this.page.getByRole('heading', { name: title })).toHaveText(title);
        await this.page.pause();
        //create By 
        await expect(this.page.locator('p').filter({ hasText: 'Created by' })).toContainText(assignee);
        //status
        await expect(this.page.locator('dd').getByText(status, { exact: true })).toHaveText(status);

    }
    
async clickMoreAndDelete(): Promise<void> {
  await this.page.getByRole('button', { name: 'More' }).click();

  await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
}

}
