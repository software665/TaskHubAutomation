import { Page, expect } from "@playwright/test";
import { Tasks } from "page-object/menu-screens/tasks-screen/Tasks.page";

export async function createSubTaskAssertDetails(
  page: Page,
  task: any
): Promise<string> {
  const tasks = new Tasks(page);

  const dateDetails = task.dateDetails?.[0];

  await tasks.createSubTask(
    task.title,
    task.assignee,
    task.priority,
    task.moreOption,
    task.dueDate,
    task.basicInformation?.category,
    task.basicInformation?.type,
    task.basicInformation?.description,
    task.basicInformation?.tags,
    task.assignment?.assignmentType,
    task.assignment?.assignTo,
    dateDetails?.date,
    dateDetails?.hour,
    dateDetails?.minute,
    dateDetails?.period,
    "#quick-due"
  );

  const subTaskId = await tasks.getSubTaskDetails(task.title);

  console.log("Created Sub-task ID:", subTaskId);

  return subTaskId;
}

export async function getSubTaskIDAssert(
  page: Page,
  task: any
): Promise<string> {
  const tasks = new Tasks(page);

  const subTaskID = await createSubTaskAssertDetails(page, task);

  console.log("Sub-task ID:", subTaskID);

  await tasks.click_SubTaskID(subTaskID);

  await expect(
    page.locator('span[aria-current="page"]')
  ).toHaveText(subTaskID);

  return subTaskID;
}

export async function checkList_Add_Assert(
  page: Page,
  dueDate: any
): Promise<void> {
  const tasks = new Tasks(page);

  await tasks.addChecklist(dueDate.checklist);
  await tasks.checkChecklist(dueDate.checklist);
  await tasks.remove_unChecklist(dueDate.checkListRemove);
}

