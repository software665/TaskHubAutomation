import { step } from "helpers/Test-Steps-Decorator";
import { Page, expect } from "@playwright/test";
import { EditTask } from "./Edit-Task";
import { DatePicker } from "page-object/utils/DatePicker";

export class Tasks extends EditTask {
  readonly datePicker: DatePicker;

  constructor(page: Page) {
    super(page);
    this.datePicker = new DatePicker(page);
  }


  @step
  async clickTaskID(taskID: string): Promise<void> {
  await this.page.getByText(taskID, { exact: true }).click();
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
    moreOptions: boolean = false,
    dueDate: boolean = false,
    categoryValue?: string,
    typeValue?: string,
    desValue?: string,
    tagValue?: string,
    assignmentType?: string,
    assignToValue?: string,
    date?: string,
    hour?: string,
    minute?: string,
    period?: "AM" | "PM",
    dueDateSelector?: string,
  ): Promise<void> {
    await this.createTaskButton();

    await this.popupField(title, assignee, priority);

    if (dueDate) {
      await this.setDueDate(dueDateSelector, date, hour, minute, period);
    }

    if (moreOptions) {
      await this.setMoreOptions(
        categoryValue,
        typeValue,
        desValue,
        tagValue,
        assignmentType,
        assignToValue,
      );
    }

    await this.createTaskButton();
  }

  async setDueDate(
    dueDateSelector?: string,
    date?: string,
    hour?: string,
    minute?: string,
    period?: "AM" | "PM",
  ): Promise<void> {
    if (!date || !hour || !minute || !period || !dueDateSelector) {
      throw new Error("Due date details are required");
    }

    await this.datePicker.selectDueDate(
      dueDateSelector,
      date,
      hour,
      minute,
      period,
    );
  }

  async setMoreOptions(
    categoryValue?: string,
    typeValue?: string,
    desValue?: string,
    tagValue?: string,
    assignmentType?: string,
    assignToValue?: string,
  ): Promise<void> {
    if (
      !categoryValue ||
      !typeValue ||
      !desValue ||
      !tagValue ||
      !assignmentType ||
      !assignToValue
    ) {
      throw new Error("More Options details are required");
    }

    await this.page.getByRole("button", { name: "More Options" }).click();

    await this.moreOptionsDropDown(
      categoryValue,
      typeValue,
      desValue,
      tagValue,
      assignmentType,
      assignToValue,
    );
  }

  @step
  async moreOptionsDropDown(
    categoryValue: string,
    typeValue: string,
    desValue: string,
    tagValue: string,
    assignmentType: string,
    assignToValue: string,
  ) {
    //basic information
    await this.basicInformation(categoryValue, typeValue, desValue, tagValue);
    //assignment
    await this.assignment(assignmentType, assignToValue);
    //planning
    //advanced
  }

  @step
  async addChecklist(checklistItems: string[]): Promise<void> {
    for (const item of checklistItems) {
      // Fill checklist name
      await this.page.getByRole("textbox", { name: "New checklist item" }).fill(item);
      // Click Add button
      await this.page.getByRole("button", { name: "Add", exact: true }).click();

      console.log(`Checklist added: ${item}`);
    }
  }

  @step
  async checkChecklist(checklistItems: string[]): Promise<void> {
    for (const item of checklistItems) {
      // 1. Find the checklist ROW by its item name.
      //    Scope to the checklist container if you have one (better than div.group).
      const row = this.page.locator("div.group").filter({has: this.page.locator("span.flex-1").getByText(item, { exact: true }),})
        .first(); // guard against stray matches

      await expect(
        row,
        `Checklist row "${item}" should be visible`,
      ).toBeVisible();

      // 2. Get the checkbox inside this specific row
      const checkbox = row.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();

      // 3. Only check if not already checked (rows like "Check wall condition"
      //    may arrive pre-checked from the template).
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
      }

      // 4. Verify checked state
      await expect(checkbox).toBeChecked();
      console.log(`Checklist "${item}" checked successfully`);
    }
  }

  @step
  async remove_unChecklist(checkListRemove: string[]): Promise<void> {
    for (const item of checkListRemove) {
      // Locate checklist row by exact item name
      const checklistRow = this.page
        .locator("div.group")
        .filter({ has: this.page.getByText(item, { exact: true }) });
      // Assert checklist item exists
      await expect(checklistRow).toBeVisible();

      // Click Remove item button
      await checklistRow.getByRole("button", { name: "Remove item" }).click();

      // Assert checklist item is removed
      await expect(checklistRow).toHaveCount(0);

      console.log(`Checklist "${item}" removed successfully`);
    }
  }

  //task ID
  @step
  async getTaskID(): Promise<string> {
    // Step 1: Locate Task ID
    const taskIdLocator = this.page
      .locator('span.inline-flex > span[aria-current="page"]')
      .filter({ hasText: /^TSK-\d{4}-\d+$/ })
      .last();

    // Step 2: Scroll into view
    //await taskIdLocator.scrollIntoViewIfNeeded();

    // Step 3: Assert Task ID is visible
    await expect(taskIdLocator).toBeVisible();

    // Step 4: Get Task ID
    const taskID = (await taskIdLocator.innerText()).trim();

    // Step 5: Validate Task ID format
    expect(taskID).toMatch(/^TSK-\d{4}-\d+$/);

    console.log(`Task ID - ${taskID}`);

    return taskID;
  }

  //assert taskID
  @step
  async assertTaskID(expectedTaskID: string): Promise<void> {
    const taskIdLocator = this.page
      .locator('span[aria-current="page"]')
      .filter({ hasText: /^TSK-\d{4}-\d+$/ });

    await expect(taskIdLocator).toHaveText(expectedTaskID);

    console.log(`Task ID verified: ${expectedTaskID}`);
  }

  @step
  async popupField(title: string, assignee: string, priority: string) {
    // Task Title
    await this.page.locator("#quick-title").fill(title);
    // Assign To
    await this.assignTo(assignee);
    // Priority
    await this.page.locator("#quick-priority").click();
    await this.page
      .getByRole("option", { name: priority, exact: true })
      .click();
  }

  @step
  async createSubTaskButton() {
    await this.page
      .getByRole("dialog", { name: "New Sub-task" })
      .getByRole("button", { name: "Create Task" })
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  @step
  async createTaskButton() {
    await this.page
      .getByRole("button", { name: "Create Task", exact: true })
      .last()
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  @step
  async subTask() {
    await this.page
      .getByRole("button", { name: "Add Sub-task", exact: true })
      .click();

    const dialog = this.page.getByRole("dialog", { name: "New Sub-task" });
    await expect(dialog).toBeVisible();
  }

  async createSubTask(
    title: string,
    assignee: string,
    priority: string,
    moreOptions: boolean = false,
    dueDate: boolean = false,
    categoryValue?: string,
    typeValue?: string,
    desValue?: string,
    tagValue?: string,
    assignmentType?: string,
    assignToValue?: string,
    date?: string,
    hour?: string,
    minute?: string,
    period?: "AM" | "PM",
    dueDateSelector?: string,
  ) {
    //createSubTask
    await this.subTask();
    //popup fileds
    await this.popupField(title, assignee, priority);

    if (dueDate) {
      await this.setDueDate(dueDateSelector, date, hour, minute, period);
    }

    if (moreOptions) {
      await this.setMoreOptions(
        categoryValue,
        typeValue,
        desValue,
        tagValue,
        assignmentType,
        assignToValue,
      );
    }

    //create subTask
    await this.createSubTaskButton();
  }

  async getSubTaskDetails(title: string): Promise<string> {
    const subTask = this.page
      .locator("button[id^='subtask-']")
      .filter({ hasText: title });

    await subTask.waitFor({ state: "visible" });

    const taskId = await subTask.locator(".font-mono").innerText();

    const taskTitle = await subTask.locator(".font-medium").innerText();

    const priority = await subTask
      .locator(".font-mono")
      .locator("xpath=following-sibling::span[1]")
      .innerText()
      .catch(() => "");

    const details = await subTask.innerText();

    console.log("Task ID:", taskId);
    console.log("Title:", taskTitle);
    console.log("Details:", details);

    return taskId;
  }

  async click_SubTaskID(taskID: string): Promise<void> {
    const subTask = this.page.locator("button[id^='subtask-']").filter({ hasText: taskID });
    await subTask.waitFor({ state: "visible" });
    await subTask.click();
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
    follower: string,
  ): Promise<void> {
    //heading
    await expect(this.page.getByRole("heading", { name: title })).toHaveText(
      title,
    );
    //create By
    await expect(
      this.page.locator("p").filter({ hasText: "Created by" }),
    ).toContainText(createdBy);
    //status text
    await this.statusText(status);
    //assignee
    const assigneesCard = this.page
      .locator("div.rounded-card")
      .filter({ hasText: "Assignees" });
    await expect(
      assigneesCard.getByText(assignee, { exact: true }),
    ).toBeVisible();

    //followers
    await this.followers(follower);
  }

  @step
  async followers(follower: string): Promise<void> {
    const followersCard = this.page
      .locator("div.rounded-card")
      .filter({
        has: this.page.getByRole("heading", {
          name: "Followers",
          exact: false,
        }),
      });

    await expect(followersCard).toBeVisible();

    const noFollowers = followersCard.getByText("No followers yet.", {
      exact: true,
    });

    const followerList = followersCard.locator("ul li");

    // Check actual UI text
    const followersText = await followersCard.innerText();

    if (followersText.includes("No followers yet.")) {
      // No followers condition
      await expect(noFollowers).toBeVisible();
      await expect(followerList).toHaveCount(0);

      console.log("Verified: No followers yet.");
    } else {
      // Followers available condition
      const followerName = followerList.filter({
        has: this.page.getByText(follower, { exact: true }),
      });

      await expect(followerName).toBeVisible();
      await expect(followerName).toContainText(follower);

      console.log(`Follower "${follower}" verified successfully`);
    }
  }

  @step
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
    const moreButton = this.page.locator('button[aria-label="More Actions"]');

    // Wait and click More button
    await moreButton.click();

    if (value === "Edit") {
      const editButton = this.page.locator("#task-action-edit");
      await editButton.click();
    } else if (value === "Reassign") {
      const reassignButton = this.page.locator("#task-action-reassign");
      await reassignButton.click();
    } else if (value === "Unfollow") {
      const unfollowButton = this.page.getByRole("button", {
        name: "Unfollow",
        exact: true,
      });

      await unfollowButton.click();
    } else if (value === "Delete") {
      const deleteButton = this.page.locator("#task-action-delete");
      await deleteButton.click();

      const warningMessage = this.page.getByText(
        "This task contains 1 sub-task. Delete the sub-task before deleting this task.",
        { exact: true },
      );

      if (await warningMessage.isVisible().catch(() => false)) {
        await expect(warningMessage).toBeVisible();

        await this.page.getByRole("button", { name: "Got it" }).click();
      } else {
        await this.page.getByRole("button", { name: "Delete task" }).click();

        await this.assertTaskDeleted();
      }
    } else {
      throw new Error(`Invalid More action: ${value}`);
    }

    console.log(`${value} button clicked successfully`);
  }
  @step
  async deleteTask() {
    await this.moreButton("Delete");
  }
  @step
  async assertTaskDeleted(): Promise<void> {
    // Locate success toast
    const successToast = this.page
      .getByRole("status")
      .filter({ hasText: "Task deleted successfully." });

    // Assert toast is visible
    await expect(successToast).toBeVisible();
  }
  @step
  async assertTaskToast(title: string, status: string): Promise<void> {
    const toast = this.page
      .locator('[role="status"]')
      .filter({ hasText: title });
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(title);
    await expect(toast).toContainText(`Status: ${status}`);
    console.log(`Toast verified: ${title} - ${status}`);
  }
  @step
  async closeToast(): Promise<void> {
    const toast = this.page.locator('[role="status"]');
    const closeButton = toast.getByRole("button", {
      name: "Dismiss notification",
    });
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
  @step
  async taskAction(action: string, status: string): Promise<void> {
    // Click task action button
    const actionButton = this.page.locator(
      `button[aria-label="${action} Task"]`,
    );

    await actionButton.click();

    // Verify updated task status
    await this.statusText(status);

    await this.closeToast();
    console.log(`${action} Task - ${status} verified successfully`);
  }

  @step
  async editTaskandSave(
    title: string,
    categoryValue: string,
    typeValue: string,
    desValue: string,
    days: string,
  ): Promise<void> {
    await this.moreButton("Edit");
    //edit page fill
    await this.editTaskScreen(title, categoryValue, typeValue, desValue, days);
  }

  @step
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
  @step
  async searchBar(taskID: string): Promise<void> {
    await this.page.locator('input[aria-label="Search tasks"]').fill(taskID);
  }

  /**
   * @param filterType - Status, Priority, or Category
   * @param value - Dropdown option to select
   */
  @step
  async filterBy(
    filterType: "Status" | "Priority" | "Category",
    value: string,
  ): Promise<void> {
    // Open the required dropdown
    const dropdown = this.page.getByRole("combobox", {
      name: `Filter by ${filterType.toLowerCase()}`,
      exact: true,
    });

    await dropdown.click();

    // Select the requested option
    const option = this.page.getByRole("option", { name: value, exact: true });

    await expect(option).toBeVisible();
    await option.click();

    // Validate the selected dropdown value
    await expect(dropdown).toContainText(value);

    // Validate active filter chip
    if (!value.startsWith("All")) {
      const activeFilters = this.page.getByLabel("Active filters");

      await expect(activeFilters).toContainText(`${filterType}:`);

      await expect(activeFilters).toContainText(value);
    }
  }

  @step
  async parentListViewAssert(
    taskID: string,
    taskName: string,
    status: string,
    priority: string,
  ): Promise<void> {
    // Find the task card using Task ID
    const taskCard = this.page.locator('[role="listitem"]').filter({ hasText: taskID });

    await expect(taskCard).toBeVisible();
    // Validate Task ID
    await expect(taskCard.locator("p").filter({ hasText: taskID })).toHaveText(taskID);
    // Validate Task Name
    await expect(taskCard.locator('[data-list-card-title="true"]')).toHaveText(taskName,{ useInnerText: true });
    // Validate Status
    await expect(taskCard.locator('dt[title="Status"] + dd')).toHaveText(status);
    // Validate Priority
    await expect(taskCard.locator('dt[title="Priority"] + dd')).toHaveText(priority);
  }

  @step
  async childTaskAssert(
  parentTaskID: string,
  childTaskID: string,
  childTaskName: string,
  status: string,
  priority: string,
  slaStatus: string
): Promise<void> {

  // Locate parent task using dynamic Task ID
  const parentRow = this.page.locator('tbody tr:not([aria-label^="Sub-task of"])').filter({ has: this.page.getByText(parentTaskID, { exact: true })});

  await expect(parentRow).toBeVisible();

  // Expand parent task if collapsed
  const expandButton = parentRow.locator('button[aria-expanded]');

  if (await expandButton.getAttribute('aria-expanded') === 'false') {
    await expandButton.click();
  }

  // Locate child task using dynamic Parent ID and Child ID
  const childRow = this.page.locator('tbody tr[aria-label^="Sub-task of"]').filter({has: this.page.getByText(childTaskID, { exact: true })});

  await expect(childRow).toBeVisible();

  // Validate parent-child relationship
  await expect(childRow).toHaveAttribute('aria-label',`Sub-task of ${parentTaskID}`);

  // Validate Child Task ID
  await expect(childRow.getByText(childTaskID, { exact: true })).toBeVisible();

  // Validate Child Task Name
  await expect(childRow.locator('span[title]')).toHaveText(childTaskName);

  // Validate Status using badge class
  await expect(childRow.locator('span.bg-status-info-bg')).toHaveText(status);

  // Validate Priority using class
  await expect(childRow.locator('span.text-secondary').filter({hasText: priority})).toHaveText(priority);

  // Validate SLA Status using badge class
  await expect(childRow.locator('span.bg-status-success-bg')).toHaveText(slaStatus);
}



  async clearFilter(): Promise<void> {
    await this.page.getByRole("button", { name: "Clear filters" }).click();
  }

  @step
  async attachements(filePaths: string[]): Promise<void> {
    const uploadButton = this.page.getByRole("button", {
      name: "Upload Files",
      exact: true,
    });

    // Assert upload button is visible
    await expect(uploadButton).toBeVisible();
    // Handle file chooser
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      uploadButton.click(),
    ]);

    // Upload files
    await fileChooser.setFiles(filePaths);
    console.log(`Files selected: ${filePaths.join(", ")}`);
  }
}
