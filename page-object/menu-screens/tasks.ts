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

    await this.popupField(title, assignee, priority);

    // Due Date
    if (dueDate) {
      await this.page.locator("#quick-due").fill(date);
    }
    if (moreOptions) {
      // More Options
      await this.page.getByRole("button", { name: "More Options" }).click();
    }
    // Create Task
    await this.createTaskButton();
    //waitfor
    await this.page.locator("div[class*='flex-wrap']").first().waitFor();
  }

  //task ID
  async getTaskID(): Promise<string> {
    const taskIdLocator = this.page
      .locator(
        'span.inline-flex:has(svg path[d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"])',
      )
      .filter({ hasText: /^TSK-\d{4}-\d+$/ });

    await taskIdLocator.last().waitFor({ state: "visible" });

    const taskID = (await taskIdLocator.last().innerText()).trim();

    console.log("Task ID -", taskID);
    return taskID;
  }

  async addTaskButton() {
    await this.page
      .getByRole("button", { name: "Create Task", exact: true })
      .last()
      .click();
  }

  async popupField(title: string, assignee: string, priority: string) {
    // Task Title
    await this.page.locator("#quick-title").fill(title);
    // Assign To
    await this.page.locator("#quick-assignee").fill(assignee);
    await this.page.getByRole("option").filter({ hasText: assignee }).click();
    // Priority
    await this.page.locator("#quick-priority").click();
    await this.page
      .getByRole("option", { name: priority, exact: true })
      .click();
  }

  async createTaskButton() {
    await this.page
      .getByRole("button", { name: "Create Task", exact: true })
      .last()
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * @param title passing string value in the title Field
   * @param assignee passing string value in the assignee Field
   * @param status passing string value in the status Field
   */

  @step
  async assertTask(
    title: string,
    assignee: string,
    status: string,
  ): Promise<void> {
    //heading
    await expect(this.page.getByRole("heading", { name: title })).toHaveText(
      title,
    );
    //create By
    await expect(
      this.page.locator("p").filter({ hasText: "Created by" }),
    ).toContainText(assignee);
    //status
    await expect(
      this.page.locator("dd").getByText(status, { exact: true }),
    ).toHaveText(status);
  }

  /**
   * Clicks the More button and selects the specified action.
   *
   * @param value - The action to perform: Edit, Reassign, Unfollow, or Delete.
   */
  @step
  async moreButton(value: string): Promise<void> {
    await this.page.getByRole("button", { name: "More" }).click();

    if (value === "Edit") {
      await this.page
        .getByRole("button", { name: "Edit", exact: true })
        .click();
    } else if (value === "Reassign") {
      await this.page
        .getByRole("button", { name: "Reassign", exact: true })
        .click();
    } else if (value === "Unfollow") {
      await this.page
        .getByRole("button", { name: "Unfollow", exact: true })
        .click();
    } else if (value === "Delete") {
      await this.page
        .getByRole("button", { name: "Delete", exact: true })
        .click();
    }
  }

  /**
   * @param accept The action to accept.
   */
  async accept(): Promise<void> {
  const actionContainer = this.page.locator("div.flex.flex-wrap.items-center.gap-2").filter({
    has: this.page.getByRole("button", {name: "Accept",exact: true})});
     await actionContainer.getByRole("button", {name: "Accept",exact: true,}).click();
  }
  
  /**
   * @param start The action to accept.
   */
  async start():Promise<void>{
    const actionContainer = this.page.locator("div.flex.flex-wrap.items-center.gap-2") 
    .filter({has: this.page.getByRole("button", {name: "Start",exact: true})})
    await actionContainer.click()

  }

  
  /**
   * @param complete The action to accept.
   */
  async complete():Promise<void>{
    const actionContainer = this.page.locator("div.flex.flex-wrap.items-center.gap-2").filter({
      has: this.page.getByRole("button", {
        name: "Complete",
        exact: true
      }),
    })
    
    await actionContainer.click()

  }

}
