
import { Page, expect } from "@playwright/test";
import { step } from "../../helpers/test-steps-decorator";

export class NavigatePages {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page
    }

    @step
    async tasks(){
        await this.page.getByRole('link', { name: 'Tasks' }).click();
    }
   
}