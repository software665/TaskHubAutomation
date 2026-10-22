
import { step } from "helpers/Test-Steps-Decorator";
import { Page, expect } from "@playwright/test";

export class EditTask{
    readonly page: Page;
    
      constructor(page: Page) {
        this.page = page;
      }

    async editTaskScreen(title:string,categoryValue:string,typeValue:string,
      desValue:string,days:string){
        //heading assert 
     await expect(this.page.getByRole('heading', { name: 'Edit Task' })).toBeVisible();
     //title 
     await expect ( this.page.locator("#title")).toHaveValue(title);
     //category
     await this.category(categoryValue);
     //type
     await this.type(typeValue);
     //description
     await this.description(desValue);
     //estimated
     await this.estimatedEffortDays(days);
     //save changes 
     await this.saveChages();

  }

    async basicInformation(categoryValue:string,typeValue:string,desValue:string,
    tagValue:string
  ):Promise<void>{
    //category
     await this.category(categoryValue);
     //type
     await this.type(typeValue);
     //description
     await this.description(desValue);
     //tag
     await this.tags(tagValue);
  }

  async assignment(assignmentType:string,assignToValue:string):Promise<void>{
    //assignmentType
    await this.selectAssignmentType(assignmentType)
    //assignTo 
    await this.assignTo(assignToValue);


  }

  async planningTab(){
    //planning 
    await this.page.getByText('Planning', { exact: true }).click();



  }

  /**
 * Select a category from the dropdown.
 * @param categoryValue - General, Follow-up, Compliance, or Administrative
 */
  async category(categoryValue:string):Promise<void>{
    await this.page.locator('#category_id').click();
    await this.page.getByRole('option', { name: categoryValue }).click();
  }

    /**
 * Select a Type from the dropdown.
 * @param typeValue - Followups
 */

  async type(typeValue: string):Promise<void>{
     await this.page.locator('#type_id').click();
    await this.page.getByRole('option', { name: typeValue }).click();

  }

  async description(desValue:string):Promise<void>{
    await this.page.locator('#description').fill(desValue)
  }

  async tags(tagValue:string):Promise<void>{
  // Locate the test tag
  const testTag = this.page.getByRole("button", {name:`${tagValue}`,exact: true});
  // Verify tag is initially unselected
  await expect(testTag).toHaveAttribute("aria-pressed", "false");
  // Click the tag
  await testTag.click();
  // Verify tag is selected
  await expect(testTag).toHaveAttribute("aria-pressed", "true");
  }

  async estimatedEffortDays(days:string):Promise<void>{
    await this.page.locator('#estimated_effort_days').fill(days)
  }

  async saveChages():Promise<void>{
    await this.page.getByRole("button",{name:'Save Changes'}).click()

  }



  async  selectAssignmentType(assignmentType: string): Promise<void> {
  const dropdown = this.page.locator("#assignment_type_select");

  // Get currently selected value
  const currentValue = (await dropdown.innerText()).trim();

  // If already selected, only assert
  if (currentValue.toLowerCase() === assignmentType.trim().toLowerCase()) {
    await expect(dropdown).toHaveText(assignmentType);
    console.log(`${assignmentType} is already selected`);
    return;
  }

  // Otherwise open dropdown
  await dropdown.click();

  // Select required option
  const option = this.page.locator("#assignment_type_select-list").getByRole("option", {name: assignmentType,exact: true,});

  await option.click();

  // Assert selected value
  await expect(dropdown).toHaveText(assignmentType);

  console.log(`${assignmentType} selected successfully`);

}



async assignTo(assignee: string): Promise<void> {
  const changeButton = this.page.getByRole("button", {name: "Change",exact: true});

  // Step 1: Click Change if visible
  if (await changeButton.isVisible()) {
    await changeButton.click();
  }

  // Step 2: Fill assignee
  const assigneeInput = this.page.locator("#quick-assignee");
  await assigneeInput.fill(assignee);

  // Step 3: Find option containing exact assignee text
  const assigneeOption = this.page.getByRole("listbox").getByRole("option").filter({has: this.page.getByText(assignee, { exact: true })});

  // Step 4: Click matching option
  await expect(assigneeOption).toBeVisible();
  await assigneeOption.click();

  console.log(`Assignee "${assignee}" selected successfully`);
}




      
    
}