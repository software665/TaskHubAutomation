
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

  /**
 * Select a category from the dropdown.
 * @param categoryValue - General, Follow-up, Compliance, or Administrative
 */
  async category(categoryValue:string){
    await this.page.locator('#category_id').click();
    await this.page.getByRole('option', { name: categoryValue }).click();
  }

    /**
 * Select a Type from the dropdown.
 * @param typeValue - Followups
 */

  async type(typeValue: string){
     await this.page.locator('#type_id').click();
    await this.page.getByRole('option', { name: typeValue }).click();

  }

  async description(desValue:string){
    await this.page.locator('#description').fill(desValue)
  }

  async estimatedEffortDays(days:string){
    await this.page.locator('#estimated_effort_days').fill(days)
  }

  async saveChages(){
    await this.page.getByRole("button",{name:'Save Changes'}).click()

  }
      
    
}