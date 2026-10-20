import { step } from "helpers/Test-Steps-Decorator";
import { Page, expect } from "@playwright/test";
import { EditTask } from "./Edit-Task";
import { DatePicker } from "page-object/utils/DatePicker";

export class Tasks {
  readonly page: Page;

  readonly datePicker :DatePicker;

  constructor(page: Page) {
    this.page = page;
    this.datePicker = new DatePicker(page);
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
    dueDate: boolean = false,
    date?: string,
    hour?: string,
    minute?: string,
    period?: 'AM' | 'PM',
    dueDateSelector?: string
): Promise<void> {

    // Open Create Task popup
    await this.addTaskButton();

    // Fill task details
    await this.popupField(title, assignee, priority);

    // Due Date
    if (dueDate) {

        // Validate required date parameters
        if (!date ||!hour ||!minute ||!period ||!dueDateSelector) {
            throw new Error(
                "When dueDate is true, date, hour, minute, period and dueDateSelector are required"
            );
        }

        await this.datePicker.selectDueDate(dueDateSelector,date,hour,minute,period);
    }

    // More Options
    if (moreOptions) {
        await this.page.getByRole("button", {name: "More Options"}).click();

        await this.page.pause();

        await this.moreOptionsDropDown();
    }

    // Create Task
    await this.createTaskButton();

    // Wait for task UI
    await this.page.locator(
        "div[class*='flex-wrap']"
    ).first().waitFor();
}


  async moreOptionsDropDown(){

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

  //assert taskID
  async assertTaskID(expectedTaskID: string): Promise<void> {
    const taskIdLocator = this.page
      .locator(
        'span.inline-flex:has(svg path[d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"])',
      )
      .filter({ hasText: /^TSK-\d{4}-\d+$/ });

    await expect(taskIdLocator.last()).toHaveText(expectedTaskID);

    console.log(`Task ID verified: ${expectedTaskID}`);
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
    createdBy: string,
    status: string,
    assignee: string,
    follower:string,

  ): Promise<void> {
    //heading
    await expect(this.page.getByRole("heading", { name: title })).toHaveText(
      title,
    );
    //create By
    await expect(this.page.locator("p").filter({ hasText: "Created by" })).toContainText(createdBy);
    //status text
    await this.statusText(status);
    //assignee
    const assigneesCard = this.page.locator("div.rounded-card").filter({ hasText: "Assignees" });
    await expect(assigneesCard.getByText(assignee, { exact: true }),).toBeVisible();
   
  }

  async followers(followers:string):Promise<void>{
     //followres
    const followersCard = this.page.locator("div.rounded-card").filter({ has: this.page.getByRole("heading", { name: "Followers" }) });
    await expect(followersCard.locator("li")).toContainText(followers);
  }

  async statusText(status: string): Promise<void> {
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

  async deleteTask() {
    await this.moreButton("Delete");
  }

  async assertTaskToast(title: string,status: string): Promise<void> {
  const toast = this.page.locator('[role="status"]').filter({hasText: title});
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(title);
  await expect(toast).toContainText(`Status: ${status}`);
  console.log(`Toast verified: ${title} - ${status}`);
}

async closeToast(): Promise<void> {
  const toast = this.page.locator('[role="status"]');
  const closeButton = toast.getByRole("button", {name: "Dismiss notification"});
  await closeButton.click();
  await expect(toast).toBeHidden();
  console.log("Toast notification closed successfully");
}

/**
 * Performs a task action, validates the updated status,
 * and dismisses the toast notification.
 *
 * @param action - Task action (Accept, Start, Pause, Resume, Complete, Close, Reopen).
 * @param status - Expected task status after the action.
 */
async taskAction(action: string, status: string): Promise<void> {

  // Click task action button
  const actionButton = this.page.locator(`button[aria-label="${action} Task"]`);

  await actionButton.click();

  // Verify updated task status
  await this.statusText(status);

  await this.closeToast();
  console.log(`${action} Task - ${status} verified successfully`);
}

 
  async editTaskandSave(
    title: string,
    categoryValue: string,
    typeValue: string,
    desValue: string,
    days: string,
  ): Promise<void> {
    const edit = new EditTask(this.page);
    await this.moreButton("Edit");
    //edit page fill
    await edit.editTaskScreen(title, categoryValue, typeValue, desValue, days);
  }

  async assertEditTask(days: string, description: string) {
    //working days
    const estimate = `${days} working days`;

    await expect(
      this.page
        .locator("div")
        .filter({
          has: this.page.locator("dt").getByText("Estimate", { exact: true }),
        })
        .getByText(estimate, { exact: true }),
    ).toBeVisible();
    //description
    await expect(
      this.page.getByText(description, { exact: true }),
    ).toBeVisible();
  }

  async searchBar(taskID:string):Promise<void>{
    await this.page.locator('input[aria-label="Search tasks"]').fill(taskID);
  }

 /**
   * @param filterType - Status, Priority, or Category
   * @param value - Dropdown option to select
   */
  async filterBy(
    filterType: 'Status' | 'Priority' | 'Category',value: string): Promise<void> {

    // Open the required dropdown
    const dropdown = this.page.getByRole('combobox', {name: `Filter by ${filterType.toLowerCase()}`,exact: true});

    await dropdown.click();

    // Select the requested option
    const option = this.page.getByRole('option', {name: value,exact: true});

    await expect(option).toBeVisible();
    await option.click();

    // Validate the selected dropdown value
    await expect(dropdown).toContainText(value);

    // Validate active filter chip
    if (!value.startsWith('All')) {
      const activeFilters = this.page.getByLabel('Active filters');

      await expect(activeFilters).toContainText(`${filterType}:`);

      await expect(activeFilters).toContainText(value);
    }
  }


async listViewAssert(
  taskID: string,
  taskName: string,
  status: string,
  priority: string,
  
): Promise<void> {

  // Find the task card using Task ID
  const taskCard = this.page.locator('[role="listitem"]').filter({ hasText: taskID });

  await expect(taskCard).toBeVisible();
  // Validate Task ID
  await expect(taskCard.locator('p').filter({hasText: taskID})).toHaveText(taskID);
  // Validate Task Name
  await expect(taskCard.locator('[data-list-card-title="true"]')).toHaveText(taskName, {useInnerText: true});
  // Validate Status
  await expect(taskCard.locator('dt[title="Status"] + dd')).toHaveText(status);
  // Validate Priority
  await expect(taskCard.locator('dt[title="Priority"] + dd')).toHaveText(priority);
}

async clearFilter():Promise<void>{
  await this.page.getByRole("button",{name:"Clear filters"}).click();
}




  async attachements(){

  }
}
