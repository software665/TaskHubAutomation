
import { Page, expect } from "@playwright/test";
import { step } from "../../helpers/test-steps-decorator";

export class NavigatePages {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page
    }

    @step
    async tasks():Promise<void>{
        await this.page.getByRole('link', { name: 'Tasks' }).click();
    }

    @step 
    async notification(taskID:string):Promise<void>{
    // Open notifications
    await this.page.getByRole("button", { name: "Notifications" }).click();
    const notificationList = this.page.locator(".max-h-popover");
    const taskNotifications = notificationList.getByRole("button").filter({ hasText: taskID });

    console.log("Task ID:", taskID);
    console.log("Notification buttons:", await notificationList.getByRole("button").count());
    console.log("Matching notifications:", await taskNotifications.count());
    console.log("Notification list text:",await this.page.locator(".max-h-popover").innerText());
    await taskNotifications.first().click();
    }


}